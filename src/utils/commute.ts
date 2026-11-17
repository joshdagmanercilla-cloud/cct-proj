import { CommuteRoute, Job } from '../types';
import { BARANGAY_ORIGINS } from '../data/initialCommuteRoutes';

export interface ComputedCommute {
  distanceKm: number;
  minutes: number;
  fare: number;
  commuteMode: string;
  modes: string[];
  stops: string[];
  level: 'very_near' | 'near' | 'moderate' | 'far' | 'remote';
  label: string;
  badgeColor: string;
  tip: string;
  originCoordinates: [number, number];
  destinationCoordinates: [number, number];
  matchedRouteId?: string;
}

export function getAreaKeyFromJob(job: Job): string {
  const full = `${job.location} ${job.exactAddress || ''} ${job.landmark || ''}`.toLowerCase();
  if (job.arrangement === 'Remote' || job.location === 'Remote') return 'Remote';
  if (full.includes('marabulig 1')) return 'Marabulig 1';
  if (full.includes('marabulig 2')) return 'Marabulig 2';
  if (full.includes('san fermin') || full.includes('sm city')) return 'San Fermin';
  if (full.includes('tagaran') || full.includes('isabela state university')) return 'Tagaran';
  if (full.includes('cabaruan') || full.includes('airport') || full.includes('cyber hub')) return 'Cabaruan';
  if (full.includes('district 1') || full.includes('poblacion') || full.includes('rizal avenue') || full.includes('centro')) return 'District 1';
  if (full.includes('alicia') || full.includes('victoria')) return 'Alicia';
  if (full.includes('naguilian')) return 'Naguilian';
  if (full.includes('san mateo')) return 'San Mateo';
  return 'District 1';
}

export function getOriginCoordinates(originBarangay: string): [number, number] {
  const exact = BARANGAY_ORIGINS.find((o) => o.value === originBarangay);
  if (exact) return exact.coordinates;
  const fuzzy = BARANGAY_ORIGINS.find((o) =>
    originBarangay.toLowerCase().includes(o.value.split(',')[0].toLowerCase())
  );
  return fuzzy ? fuzzy.coordinates : [16.9248, 121.7512];
}

export function getJobCoordinates(job: Job): [number, number] {
  const area = getAreaKeyFromJob(job);
  const coordMap: Record<string, [number, number]> = {
    'Marabulig 1': [16.9248, 121.7512],
    'Marabulig 2': [16.9189, 121.7450],
    'San Fermin': [16.9385, 121.7745],
    'District 1': [16.9312, 121.7718],
    'Tagaran': [16.9520, 121.7820],
    'Cabaruan': [16.9290, 121.7580],
    'Alicia': [16.7822, 121.6961],
    'Naguilian': [17.0250, 121.8340],
    'San Mateo': [16.8820, 121.5850],
  };
  return coordMap[area] || [16.9312, 121.7718];
}

export function computeJobCommute(
  job: Job,
  originBarangay: string,
  routes: CommuteRoute[]
): ComputedCommute {
  const originCoords = getOriginCoordinates(originBarangay);

  if (job.arrangement === 'Remote' || job.location === 'Remote') {
    return {
      distanceKm: 0,
      minutes: 0,
      fare: 0,
      commuteMode: 'Work from Home',
      modes: ['Online / Remote'],
      stops: ['Home workspace (Cauayan / Isabela)'],
      level: 'remote',
      label: 'Remote · Work from Home',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      tip: job.commuteTip || '100% online setup; no daily commute required.',
      originCoordinates: originCoords,
      destinationCoordinates: originCoords,
    };
  }

  const destKey = getAreaKeyFromJob(job).toLowerCase();
  const originKey = originBarangay.split(',')[0].toLowerCase().trim();

  // Check admin-managed CommuteRoute table first
  const directMatch = routes.find(
    (r) =>
      r.originBarangay.toLowerCase().includes(originKey) &&
      r.destinationArea.toLowerCase().includes(destKey)
  );

  if (directMatch) {
    const km = directMatch.distanceKm;
    const { level, label, badgeColor } = classifyProximity(km);
    return {
      distanceKm: km,
      minutes: directMatch.estimatedMinutes,
      fare: directMatch.farePhp,
      commuteMode: directMatch.modes.join(' / '),
      modes: directMatch.modes,
      stops: directMatch.stops,
      level,
      label,
      badgeColor,
      tip: job.commuteTip || directMatch.advisory,
      originCoordinates: directMatch.originCoordinates || originCoords,
      destinationCoordinates: directMatch.coordinates || getJobCoordinates(job),
      matchedRouteId: directMatch.id,
    };
  }

  // Fallback geometric calculation from coordinates (haversine * 1.25 road factor)
  const destCoords = getJobCoordinates(job);
  const roadKm = haversineRoadKm(originCoords, destCoords);
  const roundedKm = Math.max(0.5, Math.round(roadKm * 10) / 10);
  const { level, label, badgeColor } = classifyProximity(roundedKm);

  let minutes = Math.max(4, Math.round(roundedKm * 2.3));
  let fare = 15;
  let modes = ['Tricycle'];

  if (roundedKm <= 1.2) {
    minutes = 5;
    fare = 15;
    modes = ['Walking', 'Short Tricycle'];
  } else if (roundedKm <= 4.5) {
    minutes = Math.max(7, Math.round(roundedKm * 2.5));
    fare = 20;
    modes = ['Tricycle', 'Regular Jeepney'];
  } else if (roundedKm <= 9.0) {
    minutes = Math.max(12, Math.round(roundedKm * 2.2));
    fare = 30;
    modes = ['Regular Jeepney', 'Tricycle'];
  } else if (roundedKm <= 16.0) {
    minutes = Math.max(20, Math.round(roundedKm * 1.8));
    fare = 45;
    modes = ['Provincial Jeepney', 'Bus'];
  } else {
    minutes = Math.max(30, Math.round(roundedKm * 1.7));
    fare = 60;
    modes = ['Bus', 'Van from Central Terminal'];
  }

  return {
    distanceKm: roundedKm,
    minutes,
    fare,
    commuteMode: modes.join(' / '),
    modes,
    stops: [
      `${originBarangay.split(',')[0]} Pick-up Point`,
      'Maharlika Highway / Centro Junction',
      job.landmark || job.exactAddress || job.location,
    ],
    level,
    label,
    badgeColor,
    tip: job.commuteTip || `Direct transit from ${originBarangay.split(',')[0]} to ${job.location}.`,
    originCoordinates: originCoords,
    destinationCoordinates: destCoords,
  };
}

function classifyProximity(km: number): {
  level: 'very_near' | 'near' | 'moderate' | 'far';
  label: string;
  badgeColor: string;
} {
  if (km <= 1.5) {
    return {
      level: 'very_near',
      label: 'Very Near · Walk / Trike',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
  if (km <= 5.0) {
    return {
      level: 'very_near',
      label: 'Near · Within Cauayan',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
  if (km <= 12.0) {
    return {
      level: 'near',
      label: 'Moderate · Cauayan Metro',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    };
  }
  if (km <= 18.0) {
    return {
      level: 'moderate',
      label: 'Neighboring Town',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }
  return {
    level: 'far',
    label: 'Provincial Transit',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
  };
}

function haversineRoadKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c =
    2 *
    Math.asin(
      Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon)
    );
  return R * c * 1.25;
}
