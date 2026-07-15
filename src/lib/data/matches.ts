/**
 * Typed match data for FIFA World Cup 2026.
 * Extracted from the matches page for reuse across components and tests.
 */

export interface Match {
  id: number
  home: string
  away: string
  homeFlag: string
  awayFlag: string
  venue: string
  city: string
  date: string
  time: string
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED'
  homeScore: number | null
  awayScore: number | null
}

/**
 * Static match schedule data for the FIFA World Cup 2026 tournament.
 * Replace with a dynamic data fetch when live data becomes available.
 */
export const MATCHES: Match[] = [
  {
    id: 1,
    home: 'Brazil',
    away: 'Argentina',
    homeFlag: '🇧🇷',
    awayFlag: '🇦🇷',
    venue: 'MetLife Stadium',
    city: 'New York/New Jersey',
    date: '2026-06-15',
    time: '20:00',
    status: 'UPCOMING',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 2,
    home: 'France',
    away: 'Germany',
    homeFlag: '🇫🇷',
    awayFlag: '🇩🇪',
    venue: 'AT&T Stadium',
    city: 'Dallas',
    date: '2026-06-16',
    time: '16:00',
    status: 'UPCOMING',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 3,
    home: 'Spain',
    away: 'England',
    homeFlag: '🇪🇸',
    awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    venue: 'SoFi Stadium',
    city: 'Los Angeles',
    date: '2026-06-17',
    time: '19:00',
    status: 'UPCOMING',
    homeScore: null,
    awayScore: null,
  },
  {
    id: 4,
    home: 'USA',
    away: 'Mexico',
    homeFlag: '🇺🇸',
    awayFlag: '🇲🇽',
    venue: 'Rose Bowl',
    city: 'Los Angeles',
    date: '2026-06-18',
    time: '21:00',
    status: 'UPCOMING',
    homeScore: null,
    awayScore: null,
  },
]
