import { Player } from '../types';
import { GET_RATING_COLOR, CALCULATE_PLAYER_PRICE } from '../constants';
import { generateRandomName } from '../lib/names';

const PLAYER_DATA: Omit<Player, 'price' | 'stamina' | 'endurance'>[] = [
  // --- Boston Celtics ---
  { id: 'bos-1', name: 'Jayson Tatum', avatarUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4065648.png&w=350', teamId: 'bos', position: 'SF', rating: 95, offense: 96, defense: 90, stats: { ppg: 26.9, rpg: 8.1, apg: 4.9, spg: 1.0, bpg: 0.6 }, color: GET_RATING_COLOR(95) },
  { id: 'bos-2', name: 'Jaylen Brown', avatarUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3917376.png&w=350', teamId: 'bos', position: 'SG', rating: 92, offense: 93, defense: 91, stats: { ppg: 23.0, rpg: 5.5, apg: 3.6, spg: 1.2, bpg: 0.5 }, color: GET_RATING_COLOR(92) },
  { id: 'bos-3', name: 'Kristaps Porziņģis', avatarUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3102531.png&w=350', teamId: 'bos', position: 'C', rating: 88, offense: 89, defense: 91, stats: { ppg: 20.1, rpg: 7.2, apg: 2.0, spg: 0.7, bpg: 1.9 }, color: GET_RATING_COLOR(88) },
  { id: 'bos-4', name: 'Jrue Holiday', avatarUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3429.png&w=350', teamId: 'bos', position: 'PG', rating: 87, offense: 82, defense: 96, stats: { ppg: 12.5, rpg: 5.4, apg: 4.8, spg: 0.9, bpg: 0.8 }, color: GET_RATING_COLOR(87) },
  { id: 'bos-5', name: 'Derrick White', avatarUrl: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3133601.png&w=350', teamId: 'bos', position: 'SG', rating: 86, offense: 84, defense: 92, stats: { ppg: 15.2, rpg: 4.2, apg: 5.2, spg: 1.0, bpg: 1.2 }, color: GET_RATING_COLOR(86) },
  { id: 'bos-6', name: 'Al Horford', teamId: 'bos', position: 'C', rating: 82, offense: 78, defense: 86, stats: { ppg: 8.6, rpg: 6.4, apg: 2.6, spg: 0.6, bpg: 1.0 }, color: GET_RATING_COLOR(82) },
  { id: 'bos-7', name: 'Payton Pritchard', teamId: 'bos', position: 'PG', rating: 79, offense: 84, defense: 72, stats: { ppg: 9.6, rpg: 3.2, apg: 3.4, spg: 0.5, bpg: 0.1 }, color: GET_RATING_COLOR(79) },
  { id: 'bos-8', name: 'Sam Hauser', teamId: 'bos', position: 'SF', rating: 77, offense: 82, defense: 70, stats: { ppg: 9.0, rpg: 3.5, apg: 1.0, spg: 0.5, bpg: 0.3 }, color: GET_RATING_COLOR(77) },

  // --- Los Angeles Lakers ---
  { id: 'lak-1', name: 'LeBron James', teamId: 'lak', position: 'SF', rating: 94, offense: 95, defense: 88, stats: { ppg: 25.7, rpg: 7.3, apg: 8.3, spg: 1.3, bpg: 0.5 }, color: GET_RATING_COLOR(94) },
  { id: 'lak-2', name: 'Anthony Davis', teamId: 'lak', position: 'C', rating: 95, offense: 90, defense: 99, stats: { ppg: 24.7, rpg: 12.6, apg: 3.5, spg: 1.2, bpg: 2.3 }, color: GET_RATING_COLOR(95) },
  { id: 'lak-3', name: 'Austin Reaves', teamId: 'lak', position: 'SG', rating: 83, offense: 85, defense: 78, stats: { ppg: 15.9, rpg: 4.3, apg: 5.5, spg: 0.8, bpg: 0.3 }, color: GET_RATING_COLOR(83) },
  { id: 'lak-4', name: 'D\'Angelo Russell', teamId: 'lak', position: 'PG', rating: 83, offense: 88, defense: 72, stats: { ppg: 18.0, rpg: 3.1, apg: 6.3, spg: 0.9, bpg: 0.5 }, color: GET_RATING_COLOR(83) },
  { id: 'lak-5', name: 'Rui Hachimura', teamId: 'lak', position: 'PF', rating: 81, offense: 84, defense: 75, stats: { ppg: 13.6, rpg: 4.3, apg: 1.2, spg: 0.6, bpg: 0.4 }, color: GET_RATING_COLOR(81) },
  { id: 'lak-6', name: 'Jarred Vanderbilt', teamId: 'lak', position: 'PF', rating: 78, offense: 65, defense: 92, stats: { ppg: 5.2, rpg: 4.8, apg: 1.2, spg: 1.2, bpg: 0.2 }, color: GET_RATING_COLOR(78) },
  { id: 'lak-7', name: 'Christian Wood', teamId: 'lak', position: 'C', rating: 77, offense: 82, defense: 68, stats: { ppg: 6.9, rpg: 5.1, apg: 1.0, spg: 0.3, bpg: 0.7 }, color: GET_RATING_COLOR(77) },
  { id: 'lak-8', name: 'Gabe Vincent', teamId: 'lak', position: 'PG', rating: 76, offense: 75, defense: 82, stats: { ppg: 3.1, rpg: 0.8, apg: 1.9, spg: 0.8, bpg: 0.0 }, color: GET_RATING_COLOR(76) },

  // --- Golden State Warriors ---
  { id: 'gsw-1', name: 'Stephen Curry', teamId: 'gsw', position: 'PG', rating: 95, offense: 98, defense: 85, stats: { ppg: 26.4, rpg: 4.5, apg: 5.1, spg: 0.7, bpg: 0.4 }, color: GET_RATING_COLOR(95) },
  { id: 'gsw-2', name: 'Draymond Green', teamId: 'gsw', position: 'PF', rating: 85, offense: 75, defense: 95, stats: { ppg: 8.6, rpg: 7.2, apg: 6.0, spg: 0.9, bpg: 1.0 }, color: GET_RATING_COLOR(85) },
  { id: 'gsw-3', name: 'Andrew Wiggins', teamId: 'gsw', position: 'SF', rating: 82, offense: 81, defense: 85, stats: { ppg: 13.2, rpg: 4.5, apg: 1.7, spg: 0.6, bpg: 0.6 }, color: GET_RATING_COLOR(82) },
  { id: 'gsw-4', name: 'Jonathan Kuminga', teamId: 'gsw', position: 'PF', rating: 83, offense: 86, defense: 78, stats: { ppg: 16.1, rpg: 4.8, apg: 2.2, spg: 0.7, bpg: 0.5 }, color: GET_RATING_COLOR(83) },
  { id: 'gsw-5', name: 'Buddy Hield', teamId: 'gsw', position: 'SG', rating: 81, offense: 85, defense: 70, stats: { ppg: 12.1, rpg: 3.2, apg: 2.8, spg: 0.8, bpg: 0.5 }, color: GET_RATING_COLOR(81) },
  { id: 'gsw-6', name: 'Brandin Podziemski', teamId: 'gsw', position: 'SG', rating: 80, offense: 80, defense: 78, stats: { ppg: 9.2, rpg: 5.8, apg: 3.7, spg: 0.8, bpg: 0.2 }, color: GET_RATING_COLOR(80) },
  { id: 'gsw-7', name: 'Kevon Looney', teamId: 'gsw', position: 'C', rating: 78, offense: 68, defense: 85, stats: { ppg: 4.5, rpg: 5.7, apg: 1.8, spg: 0.4, bpg: 0.4 }, color: GET_RATING_COLOR(78) },
  { id: 'gsw-8', name: 'De\'Anthony Melton', teamId: 'gsw', position: 'PG', rating: 79, offense: 78, defense: 86, stats: { ppg: 11.1, rpg: 3.7, apg: 3.0, spg: 1.6, bpg: 0.4 }, color: GET_RATING_COLOR(79) },

  // --- Milwaukee Bucks ---
  { id: 'mil-1', name: 'Giannis Antetokounmpo', teamId: 'mil', position: 'PF', rating: 97, offense: 96, defense: 95, stats: { ppg: 30.4, rpg: 11.5, apg: 6.5, spg: 1.2, bpg: 1.1 }, color: GET_RATING_COLOR(97) },
  { id: 'mil-2', name: 'Damian Lillard', teamId: 'mil', position: 'PG', rating: 91, offense: 95, defense: 80, stats: { ppg: 24.3, rpg: 4.4, apg: 7.0, spg: 1.0, bpg: 0.2 }, color: GET_RATING_COLOR(91) },
  { id: 'mil-3', name: 'Khris Middleton', teamId: 'mil', position: 'SF', rating: 85, offense: 88, defense: 78, stats: { ppg: 15.1, rpg: 4.7, apg: 5.3, spg: 0.9, bpg: 0.3 }, color: GET_RATING_COLOR(85) },
  { id: 'mil-4', name: 'Brook Lopez', teamId: 'mil', position: 'C', rating: 83, offense: 78, defense: 92, stats: { ppg: 12.5, rpg: 5.2, apg: 1.6, spg: 0.5, bpg: 2.4 }, color: GET_RATING_COLOR(83) },
  { id: 'mil-5', name: 'Bobby Portis', teamId: 'mil', position: 'PF', rating: 82, offense: 85, defense: 72, stats: { ppg: 13.8, rpg: 7.4, apg: 1.3, spg: 0.8, bpg: 0.4 }, color: GET_RATING_COLOR(82) },
  { id: 'mil-6', name: 'Gary Trent Jr.', teamId: 'mil', position: 'SG', rating: 79, offense: 84, defense: 75, stats: { ppg: 13.7, rpg: 2.6, apg: 1.7, spg: 1.1, bpg: 0.1 }, color: GET_RATING_COLOR(79) },
  { id: 'mil-7', name: 'Taurean Prince', teamId: 'mil', position: 'SF', rating: 77, offense: 78, defense: 76, stats: { ppg: 8.9, rpg: 2.9, apg: 1.5, spg: 0.7, bpg: 0.4 }, color: GET_RATING_COLOR(77) },
  { id: 'mil-8', name: 'Delon Wright', teamId: 'mil', position: 'PG', rating: 76, offense: 72, defense: 85, stats: { ppg: 4.5, rpg: 1.8, apg: 2.5, spg: 1.1, bpg: 0.2 }, color: GET_RATING_COLOR(76) },

  // --- Phoenix Suns ---
  { id: 'phx-1', name: 'Kevin Durant', teamId: 'phx', position: 'PF', rating: 96, offense: 98, defense: 90, stats: { ppg: 27.1, rpg: 6.6, apg: 5.0, spg: 0.9, bpg: 1.2 }, color: GET_RATING_COLOR(96) },
  { id: 'phx-2', name: 'Devin Booker', teamId: 'phx', position: 'SG', rating: 94, offense: 96, defense: 86, stats: { ppg: 27.1, rpg: 4.5, apg: 6.9, spg: 0.9, bpg: 0.4 }, color: GET_RATING_COLOR(94) },
  { id: 'phx-3', name: 'Bradley Beal', teamId: 'phx', position: 'SG', rating: 87, offense: 90, defense: 78, stats: { ppg: 18.2, rpg: 4.4, apg: 5.0, spg: 1.0, bpg: 0.4 }, color: GET_RATING_COLOR(87) },
  { id: 'phx-4', name: 'Jusuf Nurkić', teamId: 'phx', position: 'C', rating: 82, offense: 78, defense: 88, stats: { ppg: 10.9, rpg: 11.0, apg: 4.0, spg: 1.1, bpg: 1.1 }, color: GET_RATING_COLOR(82) },
  { id: 'phx-5', name: 'Grayson Allen', teamId: 'phx', position: 'SG', rating: 81, offense: 86, defense: 76, stats: { ppg: 13.5, rpg: 3.9, apg: 3.0, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(81) },
  { id: 'phx-6', name: 'Tyus Jones', teamId: 'phx', position: 'PG', rating: 80, offense: 82, defense: 72, stats: { ppg: 12.0, rpg: 2.7, apg: 7.3, spg: 1.1, bpg: 0.3 }, color: GET_RATING_COLOR(80) },
  { id: 'phx-7', name: 'Royce O\'Neale', teamId: 'phx', position: 'SF', rating: 78, offense: 75, defense: 85, stats: { ppg: 7.7, rpg: 4.8, apg: 2.8, spg: 0.7, bpg: 0.6 }, color: GET_RATING_COLOR(78) },
  { id: 'phx-8', name: 'Mason Plumlee', teamId: 'phx', position: 'C', rating: 76, offense: 70, defense: 78, stats: { ppg: 5.3, rpg: 5.1, apg: 1.2, spg: 0.3, bpg: 0.4 }, color: GET_RATING_COLOR(76) },

  // --- Miami Heat ---
  { id: 'mia-1', name: 'Jimmy Butler', teamId: 'mia', position: 'SF', rating: 92, offense: 90, defense: 94, stats: { ppg: 20.8, rpg: 5.3, apg: 5.0, spg: 1.3, bpg: 0.3 }, color: GET_RATING_COLOR(92) },
  { id: 'mia-2', name: 'Bam Adebayo', teamId: 'mia', position: 'C', rating: 90, offense: 88, defense: 96, stats: { ppg: 19.3, rpg: 10.4, apg: 3.9, spg: 1.1, bpg: 0.9 }, color: GET_RATING_COLOR(90) },
  { id: 'mia-3', name: 'Tyler Herro', teamId: 'mia', position: 'SG', rating: 85, offense: 90, defense: 72, stats: { ppg: 20.8, rpg: 5.3, apg: 4.5, spg: 0.7, bpg: 0.1 }, color: GET_RATING_COLOR(85) },
  { id: 'mia-4', name: 'Terry Rozier', teamId: 'mia', position: 'PG', rating: 82, offense: 86, defense: 75, stats: { ppg: 16.4, rpg: 4.2, apg: 5.6, spg: 1.0, bpg: 0.3 }, color: GET_RATING_COLOR(82) },
  { id: 'mia-5', name: 'Jaime Jaquez Jr.', teamId: 'mia', position: 'SF', rating: 80, offense: 81, defense: 78, stats: { ppg: 11.9, rpg: 3.8, apg: 2.6, spg: 1.0, bpg: 0.3 }, color: GET_RATING_COLOR(80) },
  { id: 'mia-6', name: 'Nikola Jović', teamId: 'mia', position: 'PF', rating: 78, offense: 79, defense: 75, stats: { ppg: 7.7, rpg: 4.2, apg: 2.0, spg: 0.5, bpg: 0.3 }, color: GET_RATING_COLOR(78) },
  { id: 'mia-7', name: 'Kevin Love', teamId: 'mia', position: 'PF', rating: 77, offense: 80, defense: 70, stats: { ppg: 8.8, rpg: 6.1, apg: 2.1, spg: 0.3, bpg: 0.2 }, color: GET_RATING_COLOR(77) },
  { id: 'mia-8', name: 'Duncan Robinson', teamId: 'mia', position: 'SG', rating: 78, offense: 84, defense: 68, stats: { ppg: 12.9, rpg: 2.5, apg: 2.8, spg: 0.7, bpg: 0.2 }, color: GET_RATING_COLOR(78) },

  // --- Dallas Mavericks ---
  { id: 'dal-1', name: 'Luka Dončić', teamId: 'dal', position: 'PG', rating: 97, offense: 99, defense: 88, stats: { ppg: 33.9, rpg: 9.2, apg: 9.8, spg: 1.4, bpg: 0.5 }, color: GET_RATING_COLOR(97) },
  { id: 'dal-2', name: 'Kyrie Irving', teamId: 'dal', position: 'SG', rating: 92, offense: 97, defense: 84, stats: { ppg: 25.6, rpg: 5.0, apg: 5.2, spg: 1.3, bpg: 0.5 }, color: GET_RATING_COLOR(92) },
  { id: 'dal-3', name: 'Klay Thompson', teamId: 'dal', position: 'SG', rating: 82, offense: 86, defense: 76, stats: { ppg: 17.9, rpg: 3.3, apg: 2.3, spg: 0.6, bpg: 0.5 }, color: GET_RATING_COLOR(82) },
  { id: 'dal-4', name: 'Dereck Lively II', teamId: 'dal', position: 'C', rating: 82, offense: 75, defense: 90, stats: { ppg: 8.8, rpg: 6.9, apg: 1.1, spg: 0.7, bpg: 1.4 }, color: GET_RATING_COLOR(82) },
  { id: 'dal-5', name: 'Daniel Gafford', teamId: 'dal', position: 'C', rating: 81, offense: 78, defense: 86, stats: { ppg: 11.0, rpg: 7.6, apg: 1.6, spg: 0.9, bpg: 2.2 }, color: GET_RATING_COLOR(81) },
  { id: 'dal-6', name: 'P.J. Washington', teamId: 'dal', position: 'PF', rating: 80, offense: 80, defense: 82, stats: { ppg: 12.9, rpg: 5.6, apg: 1.9, spg: 1.0, bpg: 0.8 }, color: GET_RATING_COLOR(80) },
  { id: 'dal-7', name: 'Naji Marshall', teamId: 'dal', position: 'SF', rating: 77, offense: 75, defense: 82, stats: { ppg: 7.1, rpg: 3.6, apg: 1.9, spg: 0.7, bpg: 0.2 }, color: GET_RATING_COLOR(77) },
  { id: 'dal-8', name: 'Maxi Kleber', teamId: 'dal', position: 'PF', rating: 76, offense: 72, defense: 84, stats: { ppg: 4.4, rpg: 3.3, apg: 1.6, spg: 0.4, bpg: 0.7 }, color: GET_RATING_COLOR(76) },

  // --- Denver Nuggets ---
  { id: 'den-1', name: 'Nikola Jokić', teamId: 'den', position: 'C', rating: 98, offense: 99, defense: 94, stats: { ppg: 26.4, rpg: 12.4, apg: 9.0, spg: 1.4, bpg: 0.9 }, color: GET_RATING_COLOR(98) },
  { id: 'den-2', name: 'Jamal Murray', teamId: 'den', position: 'PG', rating: 89, offense: 92, defense: 84, stats: { ppg: 21.2, rpg: 4.1, apg: 6.5, spg: 1.0, bpg: 0.7 }, color: GET_RATING_COLOR(89) },
  { id: 'den-3', name: 'Aaron Gordon', teamId: 'den', position: 'PF', rating: 84, offense: 82, defense: 88, stats: { ppg: 13.9, rpg: 6.5, apg: 3.5, spg: 0.8, bpg: 0.6 }, color: GET_RATING_COLOR(84) },
  { id: 'den-4', name: 'Michael Porter Jr.', teamId: 'den', position: 'SF', rating: 84, offense: 88, defense: 75, stats: { ppg: 16.7, rpg: 7.0, apg: 1.5, spg: 0.5, bpg: 0.7 }, color: GET_RATING_COLOR(84) },
  { id: 'den-5', name: 'Christian Braun', teamId: 'den', position: 'SG', rating: 78, offense: 78, defense: 80, stats: { ppg: 7.3, rpg: 3.7, apg: 1.6, spg: 0.5, bpg: 0.4 }, color: GET_RATING_COLOR(78) },
  { id: 'den-6', name: 'Peyton Watson', teamId: 'den', position: 'SF', rating: 77, offense: 72, defense: 86, stats: { ppg: 6.7, rpg: 3.2, apg: 1.1, spg: 0.5, bpg: 1.1 }, color: GET_RATING_COLOR(77) },
  { id: 'den-7', name: 'Dario Šarić', teamId: 'den', position: 'PF', rating: 77, offense: 82, defense: 70, stats: { ppg: 8.0, rpg: 4.4, apg: 2.3, spg: 0.5, bpg: 0.2 }, color: GET_RATING_COLOR(77) },
  { id: 'den-8', name: 'Russell Westbrook', teamId: 'den', position: 'PG', rating: 79, offense: 82, defense: 78, stats: { ppg: 11.1, rpg: 5.0, apg: 4.5, spg: 1.1, bpg: 0.3 }, color: GET_RATING_COLOR(79) },

  // --- Oklahoma City Thunder ---
  { id: 'okc-1', name: 'Shai Gilgeous-Alexander', teamId: 'okc', position: 'PG', rating: 96, offense: 98, defense: 93, stats: { ppg: 30.1, rpg: 5.5, apg: 6.2, spg: 2.0, bpg: 0.9 }, color: GET_RATING_COLOR(96) },
  { id: 'okc-2', name: 'Chet Holmgren', teamId: 'okc', position: 'C', rating: 87, offense: 86, defense: 93, stats: { ppg: 16.5, rpg: 7.9, apg: 2.4, spg: 0.6, bpg: 2.3 }, color: GET_RATING_COLOR(87) },
  { id: 'okc-3', name: 'Jalen Williams', teamId: 'okc', position: 'SF', rating: 86, offense: 88, defense: 82, stats: { ppg: 19.1, rpg: 4.0, apg: 4.5, spg: 1.1, bpg: 0.6 }, color: GET_RATING_COLOR(86) },
  { id: 'okc-4', name: 'Alex Caruso', teamId: 'okc', position: 'SG', rating: 82, offense: 78, defense: 95, stats: { ppg: 10.1, rpg: 3.8, apg: 3.5, spg: 1.7, bpg: 1.0 }, color: GET_RATING_COLOR(82) },
  { id: 'okc-5', name: 'Isaiah Hartenstein', teamId: 'okc', position: 'C', rating: 81, offense: 76, defense: 88, stats: { ppg: 7.8, rpg: 8.3, apg: 2.5, spg: 1.2, bpg: 1.1 }, color: GET_RATING_COLOR(81) },
  { id: 'okc-6', name: 'Luguentz Dort', teamId: 'okc', position: 'SF', rating: 80, offense: 78, defense: 90, stats: { ppg: 10.9, rpg: 3.6, apg: 1.4, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(80) },
  { id: 'okc-7', name: 'Isaiah Joe', teamId: 'okc', position: 'SG', rating: 78, offense: 85, defense: 65, stats: { ppg: 8.2, rpg: 2.3, apg: 1.3, spg: 0.6, bpg: 0.3 }, color: GET_RATING_COLOR(78) },
  { id: 'okc-8', name: 'Cason Wallace', teamId: 'okc', position: 'PG', rating: 78, offense: 76, defense: 85, stats: { ppg: 6.7, rpg: 2.3, apg: 1.5, spg: 0.9, bpg: 0.5 }, color: GET_RATING_COLOR(78) },

  // --- New York Knicks ---
  { id: 'nyk-1', name: 'Jalen Brunson', teamId: 'nyk', position: 'PG', rating: 94, offense: 96, defense: 84, stats: { ppg: 28.7, rpg: 3.6, apg: 6.7, spg: 0.9, bpg: 0.2 }, color: GET_RATING_COLOR(94) },
  { id: 'nyk-2', name: 'Karl-Anthony Towns', teamId: 'nyk', position: 'C', rating: 90, offense: 92, defense: 85, stats: { ppg: 21.8, rpg: 8.3, apg: 3.0, spg: 0.7, bpg: 0.7 }, color: GET_RATING_COLOR(90) },
  { id: 'nyk-3', name: 'OG Anunoby', teamId: 'nyk', position: 'SF', rating: 88, offense: 82, defense: 97, stats: { ppg: 14.7, rpg: 4.2, apg: 2.1, spg: 1.7, bpg: 0.7 }, color: GET_RATING_COLOR(88) },
  { id: 'nyk-4', name: 'Josh Hart', teamId: 'nyk', position: 'SG', rating: 84, offense: 80, defense: 88, stats: { ppg: 9.4, rpg: 8.3, apg: 4.1, spg: 0.9, bpg: 0.3 }, color: GET_RATING_COLOR(84) },
  { id: 'nyk-5', name: 'Mikal Bridges', teamId: 'nyk', position: 'SF', rating: 86, offense: 85, defense: 92, stats: { ppg: 19.6, rpg: 4.5, apg: 3.6, spg: 1.0, bpg: 0.4 }, color: GET_RATING_COLOR(86) },
  { id: 'nyk-6', name: 'Miles McBride', teamId: 'nyk', position: 'PG', rating: 79, offense: 82, defense: 78, stats: { ppg: 8.3, rpg: 1.5, apg: 1.7, spg: 0.7, bpg: 0.1 }, color: GET_RATING_COLOR(79) },
  { id: 'nyk-7', name: 'Mitchell Robinson', teamId: 'nyk', position: 'C', rating: 81, offense: 65, defense: 94, stats: { ppg: 5.6, rpg: 8.5, apg: 0.6, spg: 1.2, bpg: 1.1 }, color: GET_RATING_COLOR(81) },
  { id: 'nyk-8', name: 'Cameron Payne', teamId: 'nyk', position: 'PG', rating: 76, offense: 80, defense: 68, stats: { ppg: 7.4, rpg: 1.5, apg: 2.6, spg: 0.5, bpg: 0.1 }, color: GET_RATING_COLOR(76) },

  // --- Minnesota Timberwolves ---
  { id: 'min-1', name: 'Anthony Edwards', teamId: 'min', position: 'SG', rating: 95, offense: 96, defense: 92, stats: { ppg: 25.9, rpg: 5.4, apg: 5.1, spg: 1.3, bpg: 0.5 }, color: GET_RATING_COLOR(95) },
  { id: 'min-2', name: 'Rudy Gobert', teamId: 'min', position: 'C', rating: 89, offense: 72, defense: 99, stats: { ppg: 14.0, rpg: 12.9, apg: 1.3, spg: 0.6, bpg: 2.1 }, color: GET_RATING_COLOR(89) },
  { id: 'min-3', name: 'Julius Randle', teamId: 'min', position: 'PF', rating: 88, offense: 90, defense: 80, stats: { ppg: 24.0, rpg: 9.2, apg: 5.0, spg: 0.5, bpg: 0.3 }, color: GET_RATING_COLOR(88) },
  { id: 'min-4', name: 'Jaden McDaniels', teamId: 'min', position: 'SF', rating: 83, offense: 78, defense: 94, stats: { ppg: 10.5, rpg: 3.1, apg: 1.4, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(83) },
  { id: 'min-5', name: 'Mike Conley', teamId: 'min', position: 'PG', rating: 82, offense: 82, defense: 84, stats: { ppg: 11.4, rpg: 2.9, apg: 5.9, spg: 1.2, bpg: 0.2 }, color: GET_RATING_COLOR(82) },
  { id: 'min-6', name: 'Naz Reid', teamId: 'min', position: 'C', rating: 83, offense: 86, defense: 78, stats: { ppg: 13.5, rpg: 5.2, apg: 1.3, spg: 0.8, bpg: 0.9 }, color: GET_RATING_COLOR(83) },
  { id: 'min-7', name: 'Donte DiVincenzo', teamId: 'min', position: 'SG', rating: 81, offense: 84, defense: 78, stats: { ppg: 15.5, rpg: 3.7, apg: 2.7, spg: 1.3, bpg: 0.4 }, color: GET_RATING_COLOR(81) },
  { id: 'min-8', name: 'Nickeil Alexander-Walker', teamId: 'min', position: 'SG', rating: 78, offense: 76, defense: 88, stats: { ppg: 8.0, rpg: 2.0, apg: 2.5, spg: 0.8, bpg: 0.5 }, color: GET_RATING_COLOR(78) },

  // --- Brooklyn Nets ---
  { id: 'bkn-1', name: 'Cam Thomas', teamId: 'bkn', position: 'SG', rating: 84, offense: 92, defense: 65, stats: { ppg: 22.5, rpg: 3.2, apg: 2.9, spg: 0.7, bpg: 0.2 }, color: GET_RATING_COLOR(84) },
  { id: 'bkn-2', name: 'Nic Claxton', teamId: 'bkn', position: 'C', rating: 82, offense: 72, defense: 94, stats: { ppg: 11.8, rpg: 9.9, apg: 2.1, spg: 0.6, bpg: 2.1 }, color: GET_RATING_COLOR(82) },
  { id: 'bkn-3', name: 'Cameron Johnson', teamId: 'bkn', position: 'SF', rating: 80, offense: 84, defense: 72, stats: { ppg: 13.4, rpg: 4.3, apg: 2.4, spg: 0.8, bpg: 0.3 }, color: GET_RATING_COLOR(80) },
  { id: 'bkn-4', name: 'Dennis Schröder', teamId: 'bkn', position: 'PG', rating: 80, offense: 82, defense: 75, stats: { ppg: 14.0, rpg: 3.0, apg: 6.1, spg: 0.9, bpg: 0.2 }, color: GET_RATING_COLOR(80) },
  { id: 'bkn-5', name: 'Dorian Finney-Smith', teamId: 'bkn', position: 'PF', rating: 78, offense: 75, defense: 85, stats: { ppg: 8.5, rpg: 4.7, apg: 1.6, spg: 0.8, bpg: 0.6 }, color: GET_RATING_COLOR(78) },
  { id: 'bkn-6', name: 'Ben Simmons', teamId: 'bkn', position: 'PG', rating: 77, offense: 68, defense: 88, stats: { ppg: 6.1, rpg: 7.9, apg: 5.7, spg: 0.8, bpg: 0.6 }, color: GET_RATING_COLOR(77) },
  { id: 'bkn-7', name: 'Bojan Bogdanović', teamId: 'bkn', position: 'SF', rating: 79, offense: 86, defense: 62, stats: { ppg: 15.2, rpg: 2.7, apg: 1.7, spg: 0.5, bpg: 0.1 }, color: GET_RATING_COLOR(79) },
  { id: 'bkn-8', name: 'Noah Clowney', teamId: 'bkn', position: 'PF', rating: 76, offense: 74, defense: 80, stats: { ppg: 5.8, rpg: 3.5, apg: 0.8, spg: 0.3, bpg: 0.7 }, color: GET_RATING_COLOR(76) },

  // --- Historical Legends & Era Variants ---
  { id: 'leg-mj-prime', name: 'Michael Jordan (90s)', teamId: 'FA', position: 'SG', rating: 99, offense: 99, defense: 99, stats: { ppg: 30.1, rpg: 6.2, apg: 5.3, spg: 2.3, bpg: 0.8 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-mj-young', name: 'Michael Jordan (80s)', teamId: 'FA', position: 'SG', rating: 96, offense: 98, defense: 92, stats: { ppg: 28.2, rpg: 6.5, apg: 5.9, spg: 2.4, bpg: 1.0 }, color: GET_RATING_COLOR(96), isLegend: true },
  
  { id: 'leg-kb-prime', name: 'Kobe Bryant (Peak)', teamId: 'FA', position: 'SG', rating: 98, offense: 99, defense: 95, stats: { ppg: 25.0, rpg: 5.2, apg: 4.7, spg: 1.4, bpg: 0.5 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-kb-8', name: 'Kobe Bryant (#8)', teamId: 'FA', position: 'SG', rating: 94, offense: 96, defense: 92, stats: { ppg: 22.5, rpg: 4.8, apg: 3.5, spg: 1.5, bpg: 0.6 }, color: GET_RATING_COLOR(94), isLegend: true },
  
  { id: 'leg-lbj-miami', name: 'LeBron James (Heat)', teamId: 'FA', position: 'SF', rating: 98, offense: 98, defense: 96, stats: { ppg: 26.9, rpg: 8.0, apg: 7.3, spg: 1.7, bpg: 0.9 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-lbj-cle1', name: 'LeBron James (Cavs 1.0)', teamId: 'FA', position: 'SF', rating: 96, offense: 97, defense: 90, stats: { ppg: 28.4, rpg: 7.2, apg: 7.0, spg: 1.8, bpg: 1.1 }, color: GET_RATING_COLOR(96), isLegend: true },
  
  { id: 'leg-shaq-lakers', name: 'Shaquille O\'Neal (Peak)', teamId: 'FA', position: 'C', rating: 98, offense: 99, defense: 92, stats: { ppg: 29.7, rpg: 13.6, apg: 3.8, spg: 0.6, bpg: 3.0 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-shaq-magic', name: 'Shaquille O\'Neal (Young)', teamId: 'FA', position: 'C', rating: 94, offense: 95, defense: 88, stats: { ppg: 27.2, rpg: 12.5, apg: 2.4, spg: 0.8, bpg: 2.8 }, color: GET_RATING_COLOR(94), isLegend: true },

  { id: 'leg-bird-bos', name: 'Larry Bird (Celtics)', teamId: 'FA', position: 'SF', rating: 97, offense: 98, defense: 90, stats: { ppg: 24.3, rpg: 10.0, apg: 6.3, spg: 1.7, bpg: 0.8 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-magic-lakers', name: 'Magic Johnson (Peak)', teamId: 'FA', position: 'PG', rating: 97, offense: 95, defense: 88, stats: { ppg: 19.5, rpg: 7.2, apg: 11.2, spg: 1.9, bpg: 0.4 }, color: GET_RATING_COLOR(97), isLegend: true },
  
  { id: 'leg-hakeem-hou', name: 'Hakeem Olajuwon (Peak)', teamId: 'FA', position: 'C', rating: 99, offense: 97, defense: 99, stats: { ppg: 27.3, rpg: 11.9, apg: 3.6, spg: 1.6, bpg: 3.7 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-duncan-sas', name: 'Tim Duncan (Peak)', teamId: 'FA', position: 'PF', rating: 97, offense: 92, defense: 99, stats: { ppg: 20.6, rpg: 12.0, apg: 3.3, spg: 0.8, bpg: 2.5 }, color: GET_RATING_COLOR(97), isLegend: true },
  
  { id: 'leg-kg-min', name: 'Kevin Garnett (Wolves)', teamId: 'FA', position: 'PF', rating: 96, offense: 90, defense: 98, stats: { ppg: 24.2, rpg: 13.9, apg: 5.0, spg: 1.5, bpg: 2.2 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-dirk-dal', name: 'Dirk Nowitzki (Peak)', teamId: 'FA', position: 'PF', rating: 96, offense: 98, defense: 80, stats: { ppg: 26.6, rpg: 9.0, apg: 2.8, spg: 0.7, bpg: 1.0 }, color: GET_RATING_COLOR(96), isLegend: true },
  
  { id: 'leg-ai-phi', name: 'Allen Iverson (Peak)', teamId: 'FA', position: 'PG', rating: 95, offense: 98, defense: 82, stats: { ppg: 31.1, rpg: 3.8, apg: 4.6, spg: 2.5, bpg: 0.3 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-wade-mia', name: 'Dwyane Wade (Peak)', teamId: 'FA', position: 'SG', rating: 96, offense: 95, defense: 92, stats: { ppg: 30.2, rpg: 5.0, apg: 7.5, spg: 2.2, bpg: 1.3 }, color: GET_RATING_COLOR(96), isLegend: true },
  
  { id: 'leg-tmac-orl', name: 'Tracy McGrady (Peak)', teamId: 'FA', position: 'SG', rating: 96, offense: 98, defense: 84, stats: { ppg: 32.1, rpg: 6.5, apg: 5.5, spg: 1.7, bpg: 0.8 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-tmac-hou', name: 'Tracy McGrady (Rockets)', teamId: 'FA', position: 'SG', rating: 93, offense: 95, defense: 82, stats: { ppg: 25.0, rpg: 5.5, apg: 5.1, spg: 1.3, bpg: 0.7 }, color: GET_RATING_COLOR(93), isLegend: true },
  
  { id: 'leg-vc-tor', name: 'Vince Carter (Raptors)', teamId: 'FA', position: 'SG', rating: 94, offense: 96, defense: 82, stats: { ppg: 27.6, rpg: 5.5, apg: 3.9, spg: 1.5, bpg: 1.1 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-barkley-sun', name: 'Charles Barkley (Peak)', teamId: 'FA', position: 'PF', rating: 97, offense: 98, defense: 88, stats: { ppg: 25.6, rpg: 12.2, apg: 5.1, spg: 1.6, bpg: 1.0 }, color: GET_RATING_COLOR(97), isLegend: true },
  
  { id: 'leg-miller-ind', name: 'Reggie Miller (Peak)', teamId: 'FA', position: 'SG', rating: 93, offense: 98, defense: 78, stats: { ppg: 24.6, rpg: 3.6, apg: 3.8, spg: 1.3, bpg: 0.2 }, color: GET_RATING_COLOR(93), isLegend: true },
  { id: 'leg-stockton-utah', name: 'John Stockton (90s)', teamId: 'FA', position: 'PG', rating: 96, offense: 90, defense: 98, stats: { ppg: 17.2, rpg: 2.6, apg: 14.5, spg: 2.7, bpg: 0.2 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-malone-utah', name: 'Karl Malone (Peak)', teamId: 'FA', position: 'PF', rating: 97, offense: 98, defense: 92, stats: { ppg: 31.0, rpg: 11.1, apg: 3.0, spg: 1.6, bpg: 0.6 }, color: GET_RATING_COLOR(97), isLegend: true },
  
  { id: 'leg-pippen-chi', name: 'Scottie Pippen (Peak)', teamId: 'FA', position: 'SF', rating: 95, offense: 88, defense: 99, stats: { ppg: 21.0, rpg: 7.7, apg: 7.0, spg: 2.9, bpg: 1.1 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-rodman-chi', name: 'Dennis Rodman (Bulls)', teamId: 'FA', position: 'PF', rating: 92, offense: 68, defense: 99, stats: { ppg: 5.7, rpg: 16.1, apg: 2.5, spg: 0.6, bpg: 0.4 }, color: GET_RATING_COLOR(92), isLegend: true },
  
  { id: 'leg-nash-sun', name: 'Steve Nash (Peak)', teamId: 'FA', position: 'PG', rating: 95, offense: 98, defense: 65, stats: { ppg: 18.8, rpg: 3.3, apg: 11.6, spg: 0.8, bpg: 0.1 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-webber-sac', name: 'Chris Webber (Kings)', teamId: 'FA', position: 'PF', rating: 92, offense: 94, defense: 88, stats: { ppg: 24.5, rpg: 11.5, apg: 4.8, spg: 1.5, bpg: 1.7 }, color: GET_RATING_COLOR(92), isLegend: true },
  
  { id: 'leg-hill-det', name: 'Grant Hill (Pistons)', teamId: 'FA', position: 'SF', rating: 92, offense: 94, defense: 84, stats: { ppg: 25.8, rpg: 6.6, apg: 5.2, spg: 1.4, bpg: 0.6 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-penny-orl', name: 'Anfernee Hardaway (Peak)', teamId: 'FA', position: 'PG', rating: 93, offense: 95, defense: 82, stats: { ppg: 21.7, rpg: 4.3, apg: 7.1, spg: 2.0, bpg: 0.5 }, color: GET_RATING_COLOR(93), isLegend: true },
  
  { id: 'leg-ewing-nyk', name: 'Patrick Ewing (Peak)', teamId: 'FA', position: 'C', rating: 95, offense: 92, defense: 96, stats: { ppg: 28.6, rpg: 10.9, apg: 2.2, spg: 1.0, bpg: 3.0 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-robinson-sas', name: 'David Robinson (MVP)', teamId: 'FA', position: 'C', rating: 96, offense: 94, defense: 98, stats: { ppg: 29.8, rpg: 10.7, apg: 4.8, spg: 1.7, bpg: 3.3 }, color: GET_RATING_COLOR(96), isLegend: true },
  
  { id: 'leg-drj-phi', name: 'Julius Erving (Sixers)', teamId: 'FA', position: 'SF', rating: 97, offense: 98, defense: 88, stats: { ppg: 24.6, rpg: 8.0, apg: 4.4, spg: 2.1, bpg: 1.8 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-kareem-lak', name: 'Kareem Abdul-Jabbar (Peak)', teamId: 'FA', position: 'C', rating: 99, offense: 99, defense: 95, stats: { ppg: 24.8, rpg: 10.8, apg: 3.4, spg: 0.8, bpg: 2.6 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-wilt-phi', name: 'Wilt Chamberlain (Peak)', teamId: 'FA', position: 'C', rating: 99, offense: 99, defense: 99, stats: { ppg: 50.4, rpg: 25.7, apg: 2.4, spg: 0.0, bpg: 0.0 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-russell-bos', name: 'Bill Russell (Peak)', teamId: 'FA', position: 'C', rating: 98, offense: 82, defense: 99, stats: { ppg: 15.1, rpg: 22.5, apg: 4.3, spg: 0.0, bpg: 8.2 }, color: GET_RATING_COLOR(98), isLegend: true },

  { id: 'leg-yao-hou', name: 'Yao Ming (Peak)', teamId: 'FA', position: 'C', rating: 93, offense: 94, defense: 92, stats: { ppg: 25.0, rpg: 9.4, apg: 2.0, spg: 0.4, bpg: 2.0 }, color: GET_RATING_COLOR(93), isLegend: true },
  { id: 'leg-lin-nyk', name: 'Jeremy Lin (Linsanity)', teamId: 'FA', position: 'PG', rating: 88, offense: 92, defense: 75, stats: { ppg: 22.5, rpg: 3.6, apg: 8.7, spg: 2.0, bpg: 0.3 }, color: GET_RATING_COLOR(88), isLegend: true },
  
  { id: 'leg-rose-chi', name: 'Derrick Rose (MVP)', teamId: 'FA', position: 'PG', rating: 94, offense: 96, defense: 80, stats: { ppg: 25.0, rpg: 4.1, apg: 7.7, spg: 1.0, bpg: 0.6 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-howard-orl', name: 'Dwight Howard (Peak)', teamId: 'FA', position: 'C', rating: 94, offense: 82, defense: 99, stats: { ppg: 22.9, rpg: 14.1, apg: 1.4, spg: 1.0, bpg: 2.8 }, color: GET_RATING_COLOR(94), isLegend: true },
  
  { id: 'leg-gasol-lak', name: 'Pau Gasol (Era)', teamId: 'FA', position: 'PF', rating: 91, offense: 92, defense: 85, stats: { ppg: 18.9, rpg: 9.6, apg: 3.5, spg: 0.5, bpg: 1.5 }, color: GET_RATING_COLOR(91), isLegend: true },
  { id: 'leg-manu-sas', name: 'Manu Ginobili (Era)', teamId: 'FA', position: 'SG', rating: 89, offense: 92, defense: 84, stats: { ppg: 19.5, rpg: 4.8, apg: 4.5, spg: 1.5, bpg: 0.4 }, color: GET_RATING_COLOR(89), isLegend: true },
  { id: 'leg-parker-sas', name: 'Tony Parker (Peak)', teamId: 'FA', position: 'PG', rating: 90, offense: 94, defense: 78, stats: { ppg: 22.0, rpg: 3.0, apg: 7.6, spg: 0.8, bpg: 0.1 }, color: GET_RATING_COLOR(90), isLegend: true },
  
  { id: 'leg-mourning-mia', name: 'Alonzo Mourning (Peak)', teamId: 'FA', position: 'C', rating: 92, offense: 85, defense: 98, stats: { ppg: 21.7, rpg: 11.0, apg: 1.6, spg: 0.5, bpg: 3.9 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-kemp-sea', name: 'Shawn Kemp (Era)', teamId: 'FA', position: 'PF', rating: 90, offense: 92, defense: 85, stats: { ppg: 19.6, rpg: 11.4, apg: 2.2, spg: 1.2, bpg: 1.6 }, color: GET_RATING_COLOR(90), isLegend: true },
  { id: 'leg-payton-sea', name: 'Gary Payton (Era)', teamId: 'FA', position: 'PG', rating: 93, offense: 88, defense: 99, stats: { ppg: 24.2, rpg: 4.4, apg: 8.9, spg: 2.5, bpg: 0.2 }, color: GET_RATING_COLOR(93), isLegend: true },

  // --- Hall of Fame Ultimate Collection ---
  { id: 'leg-magic-hof', name: 'Magic Johnson (HOF)', teamId: 'FA', position: 'PG', rating: 97, offense: 96, defense: 88, stats: { ppg: 19.5, rpg: 7.2, apg: 11.2, spg: 1.9, bpg: 0.4 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-bird-hof', name: 'Larry Bird (HOF)', teamId: 'FA', position: 'SF', rating: 97, offense: 99, defense: 90, stats: { ppg: 24.3, rpg: 10.0, apg: 6.3, spg: 1.7, bpg: 0.8 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-kareem-mil', name: 'Kareem A.Jabbar (Bucks)', teamId: 'FA', position: 'C', rating: 97, offense: 98, defense: 94, stats: { ppg: 30.4, rpg: 15.3, apg: 4.3, spg: 1.0, bpg: 3.0 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-wilt-lak', name: 'Wilt Chamberlain (Lakers)', teamId: 'FA', position: 'C', rating: 96, offense: 92, defense: 97, stats: { ppg: 17.7, rpg: 19.2, apg: 4.3, spg: 1.2, bpg: 3.5 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-west-hof', name: 'Jerry West (Peak)', teamId: 'FA', position: 'PG', rating: 96, offense: 98, defense: 92, stats: { ppg: 27.0, rpg: 5.8, apg: 6.7, spg: 2.2, bpg: 0.7 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-oscar-hof', name: 'Oscar Robertson (Peak)', teamId: 'FA', position: 'PG', rating: 97, offense: 98, defense: 85, stats: { ppg: 25.7, rpg: 7.5, apg: 9.5, spg: 1.1, bpg: 0.1 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-erving-hof', name: 'Julius Erving (Peak)', teamId: 'FA', position: 'SF', rating: 95, offense: 98, defense: 88, stats: { ppg: 24.2, rpg: 8.5, apg: 4.2, spg: 2.0, bpg: 1.7 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-moses-hof', name: 'Moses Malone (76ers)', teamId: 'FA', position: 'C', rating: 96, offense: 95, defense: 92, stats: { ppg: 20.6, rpg: 12.2, apg: 1.3, spg: 0.8, bpg: 1.3 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-hakeem-94', name: 'Hakeem Olajuwon (94)', teamId: 'FA', position: 'C', rating: 98, offense: 96, defense: 99, stats: { ppg: 27.3, rpg: 11.9, apg: 3.6, spg: 1.6, bpg: 3.7 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-ewing-prime', name: 'Patrick Ewing (Prime)', teamId: 'FA', position: 'C', rating: 94, offense: 92, defense: 96, stats: { ppg: 21.0, rpg: 9.8, apg: 1.9, spg: 1.0, bpg: 2.4 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-barkley-sun', name: 'Charles Barkley (Suns)', teamId: 'FA', position: 'PF', rating: 96, offense: 97, defense: 85, stats: { ppg: 25.6, rpg: 12.2, apg: 5.1, spg: 1.6, bpg: 1.0 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-robinson-young', name: 'David Robinson (90s)', teamId: 'FA', position: 'C', rating: 95, offense: 93, defense: 97, stats: { ppg: 23.2, rpg: 11.5, apg: 3.0, spg: 1.6, bpg: 3.5 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-malone-hof', name: 'Karl Malone (HOF)', teamId: 'FA', position: 'PF', rating: 96, offense: 98, defense: 88, stats: { ppg: 25.0, rpg: 10.1, apg: 3.6, spg: 1.4, bpg: 0.8 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-stockton-hof', name: 'John Stockton (Peak)', teamId: 'FA', position: 'PG', rating: 95, offense: 88, defense: 96, stats: { ppg: 13.1, rpg: 2.7, apg: 10.5, spg: 2.2, bpg: 0.1 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-miller-hof', name: 'Reggie Miller (Prime)', teamId: 'FA', position: 'SG', rating: 92, offense: 98, defense: 75, stats: { ppg: 18.2, rpg: 3.0, apg: 3.0, spg: 1.1, bpg: 0.2 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-drexler-hof', name: 'Clyde Drexler (HOF)', teamId: 'FA', position: 'SG', rating: 94, offense: 95, defense: 90, stats: { ppg: 20.4, rpg: 6.1, apg: 5.6, spg: 2.0, bpg: 0.7 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-payton-hof', name: 'Gary Payton (Prime)', teamId: 'FA', position: 'PG', rating: 94, offense: 90, defense: 99, stats: { ppg: 24.2, rpg: 4.8, apg: 8.9, spg: 2.4, bpg: 0.2 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-kemp-hof', name: 'Shawn Kemp (Prime)', teamId: 'FA', position: 'PF', rating: 92, offense: 94, defense: 88, stats: { ppg: 19.6, rpg: 11.4, apg: 2.2, spg: 1.2, bpg: 2.1 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-iverson-hof', name: 'Allen Iverson (MVP)', teamId: 'FA', position: 'PG', rating: 96, offense: 99, defense: 82, stats: { ppg: 31.1, rpg: 3.8, apg: 4.6, spg: 2.5, bpg: 0.3 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-tmac-hou', name: 'Tracy McGrady (Rockets)', teamId: 'FA', position: 'SG', rating: 94, offense: 96, defense: 85, stats: { ppg: 24.4, rpg: 5.3, apg: 5.9, spg: 1.5, bpg: 0.7 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-carter-tor', name: 'Vince Carter (Raptors)', teamId: 'FA', position: 'SF', rating: 94, offense: 98, defense: 80, stats: { ppg: 27.6, rpg: 5.8, apg: 3.9, spg: 1.5, bpg: 1.1 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-kg-min', name: 'Kevin Garnett (Wolves)', teamId: 'FA', position: 'PF', rating: 96, offense: 94, defense: 98, stats: { ppg: 24.2, rpg: 13.9, apg: 5.0, spg: 1.5, bpg: 2.2 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-pierce-bos', name: 'Paul Pierce (HOF)', teamId: 'FA', position: 'SF', rating: 92, offense: 94, defense: 88, stats: { ppg: 19.7, rpg: 5.6, apg: 3.5, spg: 1.3, bpg: 0.6 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-ray-mil', name: 'Ray Allen (Bucks)', teamId: 'FA', position: 'SG', rating: 91, offense: 95, defense: 82, stats: { ppg: 21.8, rpg: 4.6, apg: 4.1, spg: 1.3, bpg: 0.2 }, color: GET_RATING_COLOR(91), isLegend: true },
  { id: 'leg-ray-sea', name: 'Ray Allen (Sonics)', teamId: 'FA', position: 'SG', rating: 93, offense: 97, defense: 80, stats: { ppg: 24.6, rpg: 4.3, apg: 3.7, spg: 1.4, bpg: 0.3 }, color: GET_RATING_COLOR(93), isLegend: true },
  { id: 'leg-nash-sun', name: 'Steve Nash (Suns)', teamId: 'FA', position: 'PG', rating: 95, offense: 94, defense: 72, stats: { ppg: 15.5, rpg: 3.3, apg: 11.5, spg: 0.8, bpg: 0.1 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-kidd-nets', name: 'Jason Kidd (Nets)', teamId: 'FA', position: 'PG', rating: 94, offense: 85, defense: 98, stats: { ppg: 14.7, rpg: 7.3, apg: 9.1, spg: 2.2, bpg: 0.3 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-webber-sac', name: 'Chris Webber (Kings)', teamId: 'FA', position: 'PF', rating: 93, offense: 95, defense: 88, stats: { ppg: 23.5, rpg: 10.6, apg: 4.8, spg: 1.5, bpg: 1.6 }, color: GET_RATING_COLOR(93), isLegend: true },
  { id: 'leg-grant-hill', name: 'Grant Hill (Pistons)', teamId: 'FA', position: 'SF', rating: 92, offense: 94, defense: 88, stats: { ppg: 21.4, rpg: 7.7, apg: 6.3, spg: 1.6, bpg: 0.6 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-penny-magic', name: 'Penny Hardaway (Magic)', teamId: 'FA', position: 'PG', rating: 92, offense: 94, defense: 85, stats: { ppg: 20.9, rpg: 4.4, apg: 7.0, spg: 2.0, bpg: 0.7 }, color: GET_RATING_COLOR(92), isLegend: true },

  // --- More Legends (90s / 2000s) ---
  { id: 'leg-mutombo-1', name: 'Dikembe Mutombo', teamId: 'FA', position: 'C', rating: 91, offense: 65, defense: 99, stats: { ppg: 11.7, rpg: 10.3, apg: 1.0, spg: 0.4, bpg: 3.3 }, color: GET_RATING_COLOR(91), isLegend: true },
  { id: 'leg-zo-1', name: 'Alonzo Mourning (Hornets)', teamId: 'FA', position: 'C', rating: 89, offense: 84, defense: 92, stats: { ppg: 21.3, rpg: 10.1, apg: 1.3, spg: 0.5, bpg: 3.2 }, color: GET_RATING_COLOR(89), isLegend: true },
  { id: 'leg-richmond-1', name: 'Mitch Richmond (Kings)', teamId: 'FA', position: 'SG', rating: 91, offense: 94, defense: 78, stats: { ppg: 23.3, rpg: 3.7, apg: 4.1, spg: 1.3, bpg: 0.3 }, color: GET_RATING_COLOR(91), isLegend: true },
  { id: 'leg-hardaway-tim', name: 'Tim Hardaway (Heat)', teamId: 'FA', position: 'PG', rating: 90, offense: 92, defense: 80, stats: { ppg: 20.3, rpg: 3.4, apg: 8.6, spg: 1.9, bpg: 0.1 }, color: GET_RATING_COLOR(90), isLegend: true },
  
  { id: 'leg-webber-war', name: 'Chris Webber (Warriors)', teamId: 'FA', position: 'PF', rating: 88, offense: 90, defense: 82, stats: { ppg: 17.5, rpg: 9.1, apg: 3.6, spg: 1.2, bpg: 2.2 }, color: GET_RATING_COLOR(88), isLegend: true },
  { id: 'leg-johnson-lar', name: 'Larry Johnson (Hornets)', teamId: 'FA', position: 'PF', rating: 89, offense: 90, defense: 84, stats: { ppg: 22.1, rpg: 10.5, apg: 4.3, spg: 0.9, bpg: 0.3 }, color: GET_RATING_COLOR(89), isLegend: true },
  
  { id: 'leg-frazier-nyk', name: 'Walt Frazier', teamId: 'FA', position: 'PG', rating: 94, offense: 92, defense: 98, stats: { ppg: 18.9, rpg: 5.9, apg: 6.1, spg: 1.9, bpg: 0.2 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-reed-nyk', name: 'Willis Reed', teamId: 'FA', position: 'C', rating: 93, offense: 90, defense: 95, stats: { ppg: 18.7, rpg: 12.9, apg: 1.8, spg: 0.0, bpg: 1.1 }, color: GET_RATING_COLOR(93), isLegend: true },
  
  { id: 'leg-havlicek-bos', name: 'John Havlicek', teamId: 'FA', position: 'SF', rating: 95, offense: 94, defense: 96, stats: { ppg: 20.8, rpg: 6.3, apg: 4.8, spg: 1.2, bpg: 0.3 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-cousy-bos', name: 'Bob Cousy', teamId: 'FA', position: 'PG', rating: 92, offense: 90, defense: 82, stats: { ppg: 18.4, rpg: 5.2, apg: 7.5, spg: 0.0, bpg: 0.0 }, color: GET_RATING_COLOR(92), isLegend: true },
  
  { id: 'leg-pettit-atl', name: 'Bob Pettit', teamId: 'FA', position: 'PF', rating: 94, offense: 96, defense: 88, stats: { ppg: 26.4, rpg: 16.2, apg: 3.0, spg: 0.0, bpg: 0.0 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-barry-gsw', name: 'Rick Barry', teamId: 'FA', position: 'SF', rating: 94, offense: 97, defense: 84, stats: { ppg: 24.8, rpg: 6.7, apg: 4.9, spg: 2.0, bpg: 0.5 }, color: GET_RATING_COLOR(94), isLegend: true },

  { id: 'leg-thurmond-gsw', name: 'Nate Thurmond', teamId: 'FA', position: 'C', rating: 92, offense: 82, defense: 99, stats: { ppg: 15.0, rpg: 15.0, apg: 2.7, spg: 0.5, bpg: 2.1 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-unseld-was', name: 'Wes Unseld', teamId: 'FA', position: 'C', rating: 91, offense: 80, defense: 95, stats: { ppg: 10.8, rpg: 14.0, apg: 3.9, spg: 1.1, bpg: 0.6 }, color: GET_RATING_COLOR(91), isLegend: true },
  { id: 'leg-hayes-was', name: 'Elvin Hayes', teamId: 'FA', position: 'PF', rating: 93, offense: 92, defense: 94, stats: { ppg: 21.0, rpg: 12.5, apg: 1.8, spg: 1.0, bpg: 2.0 }, color: GET_RATING_COLOR(93), isLegend: true },

  { id: 'leg-gervin-sas', name: 'George Gervin', teamId: 'FA', position: 'SG', rating: 94, offense: 98, defense: 78, stats: { ppg: 26.2, rpg: 4.6, apg: 2.8, spg: 1.2, bpg: 1.0 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-maravich-uta', name: 'Pete Maravich', teamId: 'FA', position: 'SG', rating: 93, offense: 97, defense: 70, stats: { ppg: 24.2, rpg: 4.2, apg: 5.4, spg: 1.4, bpg: 0.3 }, color: GET_RATING_COLOR(93), isLegend: true },

  { id: 'leg-mcadoo-1', name: 'Bob McAdoo', teamId: 'FA', position: 'C', rating: 92, offense: 95, defense: 82, stats: { ppg: 22.1, rpg: 9.4, apg: 2.3, spg: 1.0, bpg: 1.5 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-cowens-bos', name: 'Dave Cowens', teamId: 'FA', position: 'C', rating: 91, offense: 88, defense: 94, stats: { ppg: 17.6, rpg: 13.6, apg: 3.8, spg: 1.1, bpg: 0.9 }, color: GET_RATING_COLOR(91), isLegend: true },

  { id: 'leg-english-den', name: 'Alex English', teamId: 'FA', position: 'SF', rating: 92, offense: 96, defense: 75, stats: { ppg: 21.5, rpg: 5.5, apg: 3.6, spg: 0.9, bpg: 0.7 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-dantley-det', name: 'Adrian Dantley', teamId: 'FA', position: 'SF', rating: 91, offense: 96, defense: 70, stats: { ppg: 24.3, rpg: 5.7, apg: 3.0, spg: 1.0, bpg: 0.2 }, color: GET_RATING_COLOR(91), isLegend: true },

  { id: 'leg-king-nyk', name: 'Bernard King', teamId: 'FA', position: 'SF', rating: 91, offense: 95, defense: 72, stats: { ppg: 22.5, rpg: 5.8, apg: 3.3, spg: 1.0, bpg: 0.3 }, color: GET_RATING_COLOR(91), isLegend: true },
  { id: 'leg-moncrief-mil', name: 'Sidney Moncrief', teamId: 'FA', position: 'SG', rating: 92, offense: 88, defense: 98, stats: { ppg: 15.6, rpg: 4.7, apg: 3.6, spg: 1.2, bpg: 0.3 }, color: GET_RATING_COLOR(92), isLegend: true },

  { id: 'leg-rice-mia', name: 'Glen Rice', teamId: 'FA', position: 'SF', rating: 88, offense: 92, defense: 75, stats: { ppg: 18.3, rpg: 4.4, apg: 2.1, spg: 1.0, bpg: 0.3 }, color: GET_RATING_COLOR(88), isLegend: true },
  { id: 'leg-smits-ind', name: 'Rik Smits', teamId: 'FA', position: 'C', rating: 86, offense: 88, defense: 78, stats: { ppg: 14.8, rpg: 6.1, apg: 1.4, spg: 0.4, bpg: 1.3 }, color: GET_RATING_COLOR(86), isLegend: true },

  { id: 'leg-stojakovic-sac', name: 'Peja Stojakovic', teamId: 'FA', position: 'SF', rating: 89, offense: 95, defense: 72, stats: { ppg: 17.0, rpg: 4.7, apg: 1.8, spg: 0.9, bpg: 0.1 }, color: GET_RATING_COLOR(89), isLegend: true },
  { id: 'leg-divac-sac', name: 'Vlade Divac', teamId: 'FA', position: 'C', rating: 87, offense: 82, defense: 85, stats: { ppg: 11.8, rpg: 8.2, apg: 3.1, spg: 1.1, bpg: 1.4 }, color: GET_RATING_COLOR(87), isLegend: true },

  { id: 'leg-brand-lac', name: 'Elton Brand', teamId: 'FA', position: 'PF', rating: 89, offense: 88, defense: 90, stats: { ppg: 15.9, rpg: 8.5, apg: 2.1, spg: 0.9, bpg: 1.7 }, color: GET_RATING_COLOR(89), isLegend: true },
  { id: 'leg-cassell-lac', name: 'Sam Cassell', teamId: 'FA', position: 'PG', rating: 87, offense: 90, defense: 75, stats: { ppg: 15.7, rpg: 3.2, apg: 6.0, spg: 1.1, bpg: 0.2 }, color: GET_RATING_COLOR(87), isLegend: true },

  { id: 'leg-johnson-kj', name: 'Kevin Johnson', teamId: 'FA', position: 'PG', rating: 90, offense: 92, defense: 75, stats: { ppg: 17.9, rpg: 3.3, apg: 9.1, spg: 1.5, bpg: 0.2 }, color: GET_RATING_COLOR(90), isLegend: true },
  { id: 'leg-chambers-sun', name: 'Tom Chambers', teamId: 'FA', position: 'PF', rating: 88, offense: 92, defense: 75, stats: { ppg: 18.1, rpg: 6.1, apg: 2.1, spg: 0.8, bpg: 0.6 }, color: GET_RATING_COLOR(88), isLegend: true },

  // --- Even More Active Team Stars ---
  // --- Atlanta Hawks ---
  { id: 'atl-1', name: 'Trae Young', teamId: 'atl', position: 'PG', rating: 90, offense: 95, defense: 68, stats: { ppg: 25.7, rpg: 2.8, apg: 10.8, spg: 1.3, bpg: 0.2 }, color: GET_RATING_COLOR(90) },
  { id: 'atl-2', name: 'Jalen Johnson', teamId: 'atl', position: 'PF', rating: 83, offense: 84, defense: 80, stats: { ppg: 16.0, rpg: 8.7, apg: 3.6, spg: 1.2, bpg: 0.8 }, color: GET_RATING_COLOR(83) },
  { id: 'atl-3', name: 'Bogdan Bogdanovic', teamId: 'atl', position: 'SG', rating: 81, offense: 85, defense: 72, stats: { ppg: 16.9, rpg: 3.4, apg: 3.1, spg: 1.2, bpg: 0.3 }, color: GET_RATING_COLOR(81) },
  { id: 'atl-4', name: 'Clint Capela', teamId: 'atl', position: 'C', rating: 80, offense: 72, defense: 88, stats: { ppg: 11.5, rpg: 10.6, apg: 1.2, spg: 0.6, bpg: 1.5 }, color: GET_RATING_COLOR(80) },
  { id: 'atl-5', name: 'Dyson Daniels', teamId: 'atl', position: 'SG', rating: 79, offense: 75, defense: 88, stats: { ppg: 8.5, rpg: 4.1, apg: 2.7, spg: 1.4, bpg: 0.4 }, color: GET_RATING_COLOR(79) },
  { id: 'atl-6', name: 'Risacher', teamId: 'atl', position: 'SF', rating: 78, offense: 80, defense: 75, stats: { ppg: 12.0, rpg: 4.0, apg: 1.5, spg: 1.0, bpg: 0.5 }, color: GET_RATING_COLOR(78) },

  // --- Chicago Bulls ---
  { id: 'chi-1', name: 'Coby White', teamId: 'chi', position: 'PG', rating: 84, offense: 88, defense: 75, stats: { ppg: 19.1, rpg: 4.5, apg: 5.1, spg: 0.7, bpg: 0.2 }, color: GET_RATING_COLOR(84) },
  { id: 'chi-2', name: 'Zach LaVine', teamId: 'chi', position: 'SG', rating: 83, offense: 88, defense: 70, stats: { ppg: 19.5, rpg: 5.2, apg: 3.9, spg: 0.8, bpg: 0.3 }, color: GET_RATING_COLOR(83) },
  { id: 'chi-3', name: 'Nikola Vucevic', teamId: 'chi', position: 'C', rating: 82, offense: 84, defense: 78, stats: { ppg: 18.0, rpg: 10.5, apg: 3.3, spg: 0.7, bpg: 0.8 }, color: GET_RATING_COLOR(82) },
  { id: 'chi-4', name: 'Josh Giddey', teamId: 'chi', position: 'PG', rating: 80, offense: 80, defense: 75, stats: { ppg: 12.3, rpg: 6.4, apg: 4.8, spg: 0.6, bpg: 0.6 }, color: GET_RATING_COLOR(80) },
  { id: 'chi-5', name: 'Matas Buzelis', teamId: 'chi', position: 'SF', rating: 77, offense: 78, defense: 76, stats: { ppg: 10.0, rpg: 5.0, apg: 1.5, spg: 0.8, bpg: 1.2 }, color: GET_RATING_COLOR(77) },

  // --- Cleveland Cavaliers ---
  { id: 'cle-1', name: 'Donovan Mitchell', teamId: 'cle', position: 'SG', rating: 92, offense: 94, defense: 85, stats: { ppg: 26.6, rpg: 5.1, apg: 6.1, spg: 1.8, bpg: 0.5 }, color: GET_RATING_COLOR(92) },
  { id: 'cle-2', name: 'Evan Mobley', teamId: 'cle', position: 'PF', rating: 86, offense: 82, defense: 94, stats: { ppg: 15.7, rpg: 9.4, apg: 3.2, spg: 0.9, bpg: 1.4 }, color: GET_RATING_COLOR(86) },
  { id: 'cle-3', name: 'Jarrett Allen', teamId: 'cle', position: 'C', rating: 85, offense: 80, defense: 92, stats: { ppg: 16.5, rpg: 10.5, apg: 2.7, spg: 0.7, bpg: 1.1 }, color: GET_RATING_COLOR(85) },
  { id: 'cle-4', name: 'Darius Garland', teamId: 'cle', position: 'PG', rating: 84, offense: 86, defense: 72, stats: { ppg: 18.0, rpg: 2.7, apg: 6.5, spg: 1.3, bpg: 0.1 }, color: GET_RATING_COLOR(84) },
  { id: 'cle-5', name: 'Caris LeVert', teamId: 'cle', position: 'SG', rating: 79, offense: 82, defense: 74, stats: { ppg: 14.0, rpg: 4.1, apg: 5.1, spg: 1.1, bpg: 0.5 }, color: GET_RATING_COLOR(79) },

  // --- Memphis Grizzlies ---
  { id: 'mem-1', name: 'Ja Morant', teamId: 'mem', position: 'PG', rating: 91, offense: 95, defense: 78, stats: { ppg: 25.1, rpg: 5.6, apg: 8.1, spg: 1.1, bpg: 0.3 }, color: GET_RATING_COLOR(91) },
  { id: 'mem-2', name: 'Jaren Jackson Jr.', teamId: 'mem', position: 'C', rating: 87, offense: 84, defense: 96, stats: { ppg: 22.5, rpg: 5.5, apg: 2.3, spg: 1.2, bpg: 1.6 }, color: GET_RATING_COLOR(87) },
  { id: 'mem-3', name: 'Desmond Bane', teamId: 'mem', position: 'SG', rating: 86, offense: 90, defense: 80, stats: { ppg: 23.7, rpg: 4.4, apg: 5.5, spg: 1.0, bpg: 0.5 }, color: GET_RATING_COLOR(86) },
  { id: 'mem-4', name: 'Marcus Smart', teamId: 'mem', position: 'PG', rating: 80, offense: 75, defense: 92, stats: { ppg: 14.5, rpg: 2.7, apg: 4.3, spg: 2.1, bpg: 0.3 }, color: GET_RATING_COLOR(80) },
  { id: 'mem-5', name: 'Zach Edey', teamId: 'mem', position: 'C', rating: 77, offense: 78, defense: 72, stats: { ppg: 12.0, rpg: 8.0, apg: 1.0, spg: 0.3, bpg: 1.5 }, color: GET_RATING_COLOR(77) },

  // --- New Orleans Pelicans ---
  { id: 'nop-1', name: 'Zion Williamson', teamId: 'nop', position: 'PF', rating: 89, offense: 94, defense: 80, stats: { ppg: 22.9, rpg: 5.8, apg: 5.0, spg: 1.1, bpg: 0.7 }, color: GET_RATING_COLOR(89) },
  { id: 'nop-2', name: 'Brandon Ingram', teamId: 'nop', position: 'SF', rating: 86, offense: 90, defense: 78, stats: { ppg: 20.8, rpg: 5.1, apg: 5.7, spg: 0.8, bpg: 0.6 }, color: GET_RATING_COLOR(86) },
  { id: 'nop-3', name: 'Dejounte Murray', teamId: 'nop', position: 'PG', rating: 87, offense: 88, defense: 88, stats: { ppg: 22.5, rpg: 5.3, apg: 6.4, spg: 1.4, bpg: 0.3 }, color: GET_RATING_COLOR(87) },
  { id: 'nop-4', name: 'CJ McCollum', teamId: 'nop', position: 'SG', rating: 84, offense: 88, defense: 75, stats: { ppg: 20.0, rpg: 4.3, apg: 4.6, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(84) },

  // --- Boston Celtics v2 ---
  { id: 'bos-1_v2', name: 'Jayson Tatum', teamId: 'bos', position: 'SF', rating: 95, offense: 96, defense: 92, stats: { ppg: 26.9, rpg: 8.1, apg: 4.9, spg: 1.0, bpg: 0.6 }, color: GET_RATING_COLOR(95) },
  { id: 'bos-2_v2', name: 'Jaylen Brown', teamId: 'bos', position: 'SG', rating: 92, offense: 94, defense: 90, stats: { ppg: 23.0, rpg: 5.5, apg: 3.6, spg: 1.2, bpg: 0.5 }, color: GET_RATING_COLOR(92) },
  { id: 'bos-3_v2', name: 'Kristaps Porzingis', teamId: 'bos', position: 'C', rating: 88, offense: 90, defense: 92, stats: { ppg: 20.1, rpg: 7.2, apg: 2.0, spg: 0.7, bpg: 1.9 }, color: GET_RATING_COLOR(88) },
  { id: 'bos-4_v2', name: 'Jrue Holiday', teamId: 'bos', position: 'PG', rating: 87, offense: 84, defense: 98, stats: { ppg: 12.5, rpg: 5.4, apg: 4.8, spg: 0.9, bpg: 0.8 }, color: GET_RATING_COLOR(87) },
  { id: 'bos-5_v2', name: 'Derrick White', teamId: 'bos', position: 'SG', rating: 86, offense: 82, defense: 94, stats: { ppg: 15.2, rpg: 4.2, apg: 5.2, spg: 1.0, bpg: 1.2 }, color: GET_RATING_COLOR(86) },
  { id: 'bos-6_v2', name: 'Al Horford', teamId: 'bos', position: 'C', rating: 81, offense: 78, defense: 88, stats: { ppg: 8.6, rpg: 6.4, apg: 2.6, spg: 0.6, bpg: 1.0 }, color: GET_RATING_COLOR(81) },

  // --- Brooklyn Nets v2 ---
  { id: 'bkn-1_v2', name: 'Cameron Thomas', teamId: 'bkn', position: 'SG', rating: 82, offense: 90, defense: 65, stats: { ppg: 22.5, rpg: 3.2, apg: 2.9, spg: 0.7, bpg: 0.2 }, color: GET_RATING_COLOR(82) },
  { id: 'bkn-2_v2', name: 'Nic Claxton', teamId: 'bkn', position: 'C', rating: 81, offense: 72, defense: 90, stats: { ppg: 11.8, rpg: 9.9, apg: 2.1, spg: 0.6, bpg: 2.1 }, color: GET_RATING_COLOR(81) },
  { id: 'bkn-3_v2', name: 'Cameron Johnson', teamId: 'bkn', position: 'PF', rating: 80, offense: 82, defense: 76, stats: { ppg: 13.4, rpg: 4.3, apg: 2.4, spg: 0.8, bpg: 0.3 }, color: GET_RATING_COLOR(80) },
  { id: 'bkn-4_v2', name: 'Dennis Schroder', teamId: 'bkn', position: 'PG', rating: 79, offense: 80, defense: 72, stats: { ppg: 14.0, rpg: 3.0, apg: 6.1, spg: 0.9, bpg: 0.2 }, color: GET_RATING_COLOR(79) },

  // --- Charlotte Hornets ---
  { id: 'cha-1', name: 'LaMelo Ball', teamId: 'cha', position: 'PG', rating: 88, offense: 92, defense: 78, stats: { ppg: 23.9, rpg: 5.1, apg: 8.0, spg: 1.8, bpg: 0.2 }, color: GET_RATING_COLOR(88) },
  { id: 'cha-2', name: 'Miles Bridges', teamId: 'cha', position: 'PF', rating: 83, offense: 85, defense: 78, stats: { ppg: 21.0, rpg: 7.3, apg: 3.3, spg: 0.9, bpg: 0.5 }, color: GET_RATING_COLOR(83) },
  { id: 'cha-3', name: 'Brandon Miller', teamId: 'cha', position: 'SF', rating: 82, offense: 84, defense: 80, stats: { ppg: 17.3, rpg: 4.3, apg: 2.4, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(82) },
  { id: 'cha-4', name: 'Tre Mann', teamId: 'cha', position: 'SG', rating: 77, offense: 80, defense: 68, stats: { ppg: 11.9, rpg: 4.5, apg: 5.2, spg: 1.7, bpg: 0.1 }, color: GET_RATING_COLOR(77) },

  // --- Dallas Mavericks v2 ---
  { id: 'dal-1_v2', name: 'Luka Doncic', teamId: 'dal', position: 'PG', rating: 97, offense: 99, defense: 85, stats: { ppg: 33.9, rpg: 9.2, apg: 9.8, spg: 1.4, bpg: 0.5 }, color: GET_RATING_COLOR(97) },
  { id: 'dal-2_v2', name: 'Kyrie Irving', teamId: 'dal', position: 'SG', rating: 92, offense: 98, defense: 78, stats: { ppg: 25.6, rpg: 5.0, apg: 5.2, spg: 1.3, bpg: 0.5 }, color: GET_RATING_COLOR(92) },
  { id: 'dal-3_v2', name: 'Dereck Lively II', teamId: 'dal', position: 'C', rating: 81, offense: 75, defense: 88, stats: { ppg: 8.8, rpg: 6.9, apg: 1.1, spg: 0.7, bpg: 1.4 }, color: GET_RATING_COLOR(81) },
  { id: 'dal-4_v2', name: 'Klay Thompson', teamId: 'dal', position: 'SF', rating: 82, offense: 85, defense: 75, stats: { ppg: 17.9, rpg: 3.3, apg: 2.3, spg: 0.6, bpg: 0.5 }, color: GET_RATING_COLOR(82) },
  { id: 'dal-5_v2', name: 'PJ Washington', teamId: 'dal', position: 'PF', rating: 80, offense: 78, defense: 85, stats: { ppg: 12.9, rpg: 5.6, apg: 1.9, spg: 1.0, bpg: 0.8 }, color: GET_RATING_COLOR(80) },
  { id: 'dal-6_v2', name: 'Daniel Gafford', teamId: 'dal', position: 'C', rating: 80, offense: 72, defense: 84, stats: { ppg: 11.2, rpg: 7.6, apg: 1.6, spg: 0.9, bpg: 2.1 }, color: GET_RATING_COLOR(80) },

  // --- Denver Nuggets v2 ---
  { id: 'den-1_v2', name: 'Nikola Jokic', teamId: 'den', position: 'C', rating: 98, offense: 99, defense: 94, stats: { ppg: 26.4, rpg: 12.4, apg: 9.0, spg: 1.4, bpg: 0.9 }, color: GET_RATING_COLOR(98) },
  { id: 'den-2_v2', name: 'Jamal Murray', teamId: 'den', position: 'PG', rating: 88, offense: 92, defense: 80, stats: { ppg: 21.2, rpg: 4.1, apg: 6.5, spg: 1.0, bpg: 0.7 }, color: GET_RATING_COLOR(88) },
  { id: 'den-3_v2', name: 'Aaron Gordon', teamId: 'den', position: 'PF', rating: 84, offense: 82, defense: 88, stats: { ppg: 13.9, rpg: 6.5, apg: 3.5, spg: 0.8, bpg: 0.6 }, color: GET_RATING_COLOR(84) },
  { id: 'den-4_v2', name: 'Michael Porter Jr.', teamId: 'den', position: 'SF', rating: 83, offense: 88, defense: 75, stats: { ppg: 16.7, rpg: 7.0, apg: 1.5, spg: 0.5, bpg: 0.7 }, color: GET_RATING_COLOR(83) },
  { id: 'den-5_v2', name: 'Russell Westbrook', teamId: 'den', position: 'PG', rating: 81, offense: 82, defense: 78, stats: { ppg: 11.1, rpg: 5.0, apg: 4.5, spg: 1.1, bpg: 0.3 }, color: GET_RATING_COLOR(81) },

  // --- Detroit Pistons v2 ---
  { id: 'det-1_v2', name: 'Cade Cunningham', teamId: 'det', position: 'PG', rating: 86, offense: 88, defense: 82, stats: { ppg: 22.7, rpg: 4.3, apg: 7.5, spg: 0.9, bpg: 0.4 }, color: GET_RATING_COLOR(86) },
  { id: 'det-2_v2', name: 'Jaden Ivey', teamId: 'det', position: 'SG', rating: 80, offense: 84, defense: 72, stats: { ppg: 15.4, rpg: 3.4, apg: 3.8, spg: 0.7, bpg: 0.5 }, color: GET_RATING_COLOR(80) },
  { id: 'det-3_v2', name: 'Jalen Duren', teamId: 'det', position: 'C', rating: 81, offense: 75, defense: 85, stats: { ppg: 13.8, rpg: 11.6, apg: 2.4, spg: 0.5, bpg: 0.8 }, color: GET_RATING_COLOR(81) },
  { id: 'det-4_v2', name: 'Tobias Harris', teamId: 'det', position: 'PF', rating: 80, offense: 82, defense: 75, stats: { ppg: 17.2, rpg: 6.5, apg: 3.1, spg: 1.0, bpg: 0.5 }, color: GET_RATING_COLOR(80) },

  // --- Golden State Warriors v2 ---
  { id: 'gsw-1_v2', name: 'Stephen Curry', teamId: 'gsw', position: 'PG', rating: 96, offense: 99, defense: 80, stats: { ppg: 26.4, rpg: 4.5, apg: 5.1, spg: 0.7, bpg: 0.4 }, color: GET_RATING_COLOR(96) },
  { id: 'gsw-2_v2', name: 'Andrew Wiggins', teamId: 'gsw', position: 'SF', rating: 81, offense: 80, defense: 85, stats: { ppg: 13.2, rpg: 4.5, apg: 1.7, spg: 0.6, bpg: 0.6 }, color: GET_RATING_COLOR(81) },
  { id: 'gsw-3_v2', name: 'Draymond Green', teamId: 'gsw', position: 'PF', rating: 83, offense: 75, defense: 95, stats: { ppg: 8.6, rpg: 7.2, apg: 6.0, spg: 1.0, bpg: 0.9 }, color: GET_RATING_COLOR(83) },
  { id: 'gsw-4_v2', name: 'Jonathan Kuminga', teamId: 'gsw', position: 'PF', rating: 82, offense: 85, defense: 78, stats: { ppg: 16.1, rpg: 4.8, apg: 2.2, spg: 0.7, bpg: 0.5 }, color: GET_RATING_COLOR(82) },
  { id: 'gsw-5_v2', name: 'Buddy Hield', teamId: 'gsw', position: 'SG', rating: 81, offense: 88, defense: 68, stats: { ppg: 12.1, rpg: 3.2, apg: 2.8, spg: 0.8, bpg: 0.5 }, color: GET_RATING_COLOR(81) },
  { id: 'gsw-6_v2', name: 'Brandin Podziemski', teamId: 'gsw', position: 'SG', rating: 80, offense: 78, defense: 78, stats: { ppg: 9.2, rpg: 5.8, apg: 3.7, spg: 0.8, bpg: 0.2 }, color: GET_RATING_COLOR(80) },

  // --- Houston Rockets ---
  { id: 'hou-1', name: 'Alperen Sengun', teamId: 'hou', position: 'C', rating: 86, offense: 88, defense: 80, stats: { ppg: 21.1, rpg: 9.3, apg: 5.0, spg: 1.2, bpg: 0.7 }, color: GET_RATING_COLOR(86) },
  { id: 'hou-2', name: 'Fred VanVleet', teamId: 'hou', position: 'PG', rating: 84, offense: 82, defense: 85, stats: { ppg: 17.4, rpg: 3.8, apg: 8.1, spg: 1.4, bpg: 0.8 }, color: GET_RATING_COLOR(84) },
  { id: 'hou-3', name: 'Jalen Green', teamId: 'hou', position: 'SG', rating: 83, offense: 88, defense: 72, stats: { ppg: 19.6, rpg: 5.2, apg: 3.5, spg: 0.8, bpg: 0.3 }, color: GET_RATING_COLOR(83) },
  { id: 'hou-4', name: 'Amen Thompson', teamId: 'hou', position: 'SF', rating: 80, offense: 75, defense: 88, stats: { ppg: 9.5, rpg: 6.6, apg: 2.6, spg: 1.3, bpg: 0.6 }, color: GET_RATING_COLOR(80) },

  // --- Indiana Pacers ---
  { id: 'ind-1', name: 'Tyrese Haliburton', teamId: 'ind', position: 'PG', rating: 91, offense: 96, defense: 78, stats: { ppg: 20.1, rpg: 3.9, apg: 10.9, spg: 1.2, bpg: 0.7 }, color: GET_RATING_COLOR(91) },
  { id: 'ind-2', name: 'Pascal Siakam', teamId: 'ind', position: 'PF', rating: 87, offense: 88, defense: 84, stats: { ppg: 21.7, rpg: 7.1, apg: 4.3, spg: 0.8, bpg: 0.3 }, color: GET_RATING_COLOR(87) },
  { id: 'ind-3', name: 'Myles Turner', teamId: 'ind', position: 'C', rating: 84, offense: 82, defense: 92, stats: { ppg: 17.1, rpg: 6.9, apg: 1.3, spg: 0.5, bpg: 1.9 }, color: GET_RATING_COLOR(84) },
  { id: 'ind-4', name: 'Bennedict Mathurin', teamId: 'ind', position: 'SG', rating: 80, offense: 85, defense: 72, stats: { ppg: 14.5, rpg: 4.0, apg: 2.0, spg: 0.6, bpg: 0.2 }, color: GET_RATING_COLOR(80) },

  // --- LA Clippers ---
  { id: 'lac-1', name: 'Kawhi Leonard', teamId: 'lac', position: 'SF', rating: 93, offense: 94, defense: 96, stats: { ppg: 23.7, rpg: 6.1, apg: 3.6, spg: 1.6, bpg: 0.9 }, color: GET_RATING_COLOR(93) },
  { id: 'lac-2', name: 'James Harden', teamId: 'lac', position: 'PG', rating: 89, offense: 92, defense: 75, stats: { ppg: 16.6, rpg: 5.1, apg: 8.5, spg: 1.1, bpg: 0.7 }, color: GET_RATING_COLOR(89) },
  { id: 'lac-3', name: 'Ivica Zubac', teamId: 'lac', position: 'C', rating: 82, offense: 78, defense: 85, stats: { ppg: 11.7, rpg: 9.2, apg: 1.4, spg: 0.3, bpg: 1.2 }, color: GET_RATING_COLOR(82) },
  { id: 'lac-4', name: 'Norman Powell', teamId: 'lac', position: 'SG', rating: 80, offense: 85, defense: 70, stats: { ppg: 13.9, rpg: 2.6, apg: 1.1, spg: 0.6, bpg: 0.3 }, color: GET_RATING_COLOR(80) },

  // --- Los Angeles Lakers ---
  { id: 'lak-1_v2', name: 'LeBron James', teamId: 'lak', position: 'SF', rating: 96, offense: 97, defense: 88, stats: { ppg: 25.7, rpg: 7.3, apg: 8.3, spg: 1.3, bpg: 0.5 }, color: GET_RATING_COLOR(96) },
  { id: 'lak-2_v2', name: 'Anthony Davis', teamId: 'lak', position: 'C', rating: 94, offense: 92, defense: 98, stats: { ppg: 24.7, rpg: 12.6, apg: 3.5, spg: 1.2, bpg: 2.3 }, color: GET_RATING_COLOR(94) },
  { id: 'lak-3_v2', name: 'Austin Reaves', teamId: 'lak', position: 'SG', rating: 83, offense: 85, defense: 75, stats: { ppg: 15.9, rpg: 4.3, apg: 5.5, spg: 0.8, bpg: 0.3 }, color: GET_RATING_COLOR(83) },
  { id: 'lak-4_v2', name: "D'Angelo Russell", teamId: 'lak', position: 'PG', rating: 82, offense: 86, defense: 70, stats: { ppg: 18.0, rpg: 3.1, apg: 6.3, spg: 0.9, bpg: 0.5 }, color: GET_RATING_COLOR(82) },
  { id: 'lak-5_v2', name: 'Rui Hachimura', teamId: 'lak', position: 'PF', rating: 79, offense: 82, defense: 75, stats: { ppg: 13.6, rpg: 4.3, apg: 1.2, spg: 0.6, bpg: 0.4 }, color: GET_RATING_COLOR(79) },

  // --- Miami Heat v2 ---
  { id: 'mia-1_v2', name: 'Jimmy Butler', teamId: 'mia', position: 'SF', rating: 90, offense: 88, defense: 94, stats: { ppg: 20.8, rpg: 5.3, apg: 5.0, spg: 1.3, bpg: 0.3 }, color: GET_RATING_COLOR(90) },
  { id: 'mia-2_v2', name: 'Bam Adebayo', teamId: 'mia', position: 'C', rating: 88, offense: 82, defense: 96, stats: { ppg: 19.3, rpg: 10.4, apg: 3.9, spg: 1.1, bpg: 0.9 }, color: GET_RATING_COLOR(88) },
  { id: 'mia-3_v2', name: 'Tyler Herro', teamId: 'mia', position: 'SG', rating: 84, offense: 88, defense: 70, stats: { ppg: 20.8, rpg: 5.3, apg: 4.5, spg: 0.7, bpg: 0.1 }, color: GET_RATING_COLOR(84) },
  { id: 'mia-4_v2', name: 'Terry Rozier', teamId: 'mia', position: 'PG', rating: 80, offense: 84, defense: 74, stats: { ppg: 16.0, rpg: 4.0, apg: 5.0, spg: 0.9, bpg: 0.3 }, color: GET_RATING_COLOR(80) },

  // --- Milwaukee Bucks v2 ---
  { id: 'mil-1_v2', name: 'Giannis Antetokounmpo', teamId: 'mil', position: 'PF', rating: 97, offense: 98, defense: 96, stats: { ppg: 30.4, rpg: 11.5, apg: 6.5, spg: 1.2, bpg: 1.1 }, color: GET_RATING_COLOR(97) },
  { id: 'mil-2_v2', name: 'Damian Lillard', teamId: 'mil', position: 'PG', rating: 91, offense: 96, defense: 75, stats: { ppg: 24.3, rpg: 4.4, apg: 7.0, spg: 1.0, bpg: 0.2 }, color: GET_RATING_COLOR(91) },
  { id: 'mil-3_v2', name: 'Khris Middleton', teamId: 'mil', position: 'SF', rating: 85, offense: 88, defense: 80, stats: { ppg: 15.1, rpg: 4.7, apg: 5.3, spg: 0.9, bpg: 0.3 }, color: GET_RATING_COLOR(85) },
  { id: 'mil-4_v2', name: 'Brook Lopez', teamId: 'mil', position: 'C', rating: 81, offense: 78, defense: 92, stats: { ppg: 12.5, rpg: 5.2, apg: 1.6, spg: 0.5, bpg: 2.4 }, color: GET_RATING_COLOR(81) },

  // --- Minnesota Timberwolves v2 ---
  { id: 'min-1_v2', name: 'Anthony Edwards', teamId: 'min', position: 'SG', rating: 93, offense: 95, defense: 88, stats: { ppg: 25.9, rpg: 5.4, apg: 5.1, spg: 1.3, bpg: 0.5 }, color: GET_RATING_COLOR(93) },
  { id: 'min-2_v2', name: 'Rudy Gobert', teamId: 'min', position: 'C', rating: 87, offense: 65, defense: 99, stats: { ppg: 14.0, rpg: 12.9, apg: 1.3, spg: 0.7, bpg: 2.1 }, color: GET_RATING_COLOR(87) },
  { id: 'min-3_v2', name: 'Julius Randle', teamId: 'min', position: 'PF', rating: 86, offense: 88, defense: 78, stats: { ppg: 24.0, rpg: 9.2, apg: 5.0, spg: 0.5, bpg: 0.3 }, color: GET_RATING_COLOR(86) },
  { id: 'min-4_v2', name: 'Mike Conley', teamId: 'min', position: 'PG', rating: 81, offense: 80, defense: 82, stats: { ppg: 11.4, rpg: 2.9, apg: 5.9, spg: 1.2, bpg: 0.2 }, color: GET_RATING_COLOR(81) },
  { id: 'min-5_v2', name: 'Naz Reid', teamId: 'min', position: 'C', rating: 82, offense: 85, defense: 78, stats: { ppg: 13.5, rpg: 5.2, apg: 1.3, spg: 0.8, bpg: 0.9 }, color: GET_RATING_COLOR(82) },

  // --- New York Knicks v2 ---
  { id: 'nyk-1_v2', name: 'Jalen Brunson', teamId: 'nyk', position: 'PG', rating: 92, offense: 96, defense: 80, stats: { ppg: 28.7, rpg: 3.6, apg: 6.7, spg: 0.9, bpg: 0.2 }, color: GET_RATING_COLOR(92) },
  { id: 'nyk-2_v2', name: 'Karl-Anthony Towns', teamId: 'nyk', position: 'C', rating: 89, offense: 93, defense: 82, stats: { ppg: 21.8, rpg: 8.3, apg: 3.0, spg: 0.7, bpg: 0.7 }, color: GET_RATING_COLOR(89) },
  { id: 'nyk-3_v2', name: 'Mikal Bridges', teamId: 'nyk', position: 'SF', rating: 85, offense: 84, defense: 90, stats: { ppg: 19.6, rpg: 4.5, apg: 3.6, spg: 1.0, bpg: 0.4 }, color: GET_RATING_COLOR(85) },
  { id: 'nyk-4_v2', name: 'OG Anunoby', teamId: 'nyk', position: 'SF', rating: 84, offense: 80, defense: 95, stats: { ppg: 14.7, rpg: 4.2, apg: 2.1, spg: 1.4, bpg: 0.7 }, color: GET_RATING_COLOR(84) },
  { id: 'nyk-5_v2', name: 'Josh Hart', teamId: 'nyk', position: 'SF', rating: 82, offense: 78, defense: 88, stats: { ppg: 9.4, rpg: 8.3, apg: 4.1, spg: 0.9, bpg: 0.3 }, color: GET_RATING_COLOR(82) },

  // --- Oklahoma City Thunder v2 ---
  { id: 'okc-1_v2', name: 'Shai Gilgeous-Alexander', teamId: 'okc', position: 'PG', rating: 96, offense: 98, defense: 94, stats: { ppg: 30.1, rpg: 5.5, apg: 6.2, spg: 2.0, bpg: 0.9 }, color: GET_RATING_COLOR(96) },
  { id: 'okc-2_v2', name: 'Chet Holmgren', teamId: 'okc', position: 'C', rating: 88, offense: 85, defense: 96, stats: { ppg: 16.5, rpg: 7.9, apg: 2.4, spg: 0.6, bpg: 2.3 }, color: GET_RATING_COLOR(88) },
  { id: 'okc-3_v2', name: 'Jalen Williams', teamId: 'okc', position: 'PF', rating: 87, offense: 88, defense: 85, stats: { ppg: 19.1, rpg: 4.0, apg: 4.5, spg: 1.1, bpg: 0.6 }, color: GET_RATING_COLOR(87) },
  { id: 'okc-4_v2', name: 'Alex Caruso', teamId: 'okc', position: 'SG', rating: 82, offense: 75, defense: 98, stats: { ppg: 10.1, rpg: 3.8, apg: 3.5, spg: 1.7, bpg: 1.0 }, color: GET_RATING_COLOR(82) },
  { id: 'okc-5_v2', name: 'Isaiah Hartenstein', teamId: 'okc', position: 'C', rating: 81, offense: 72, defense: 88, stats: { ppg: 7.8, rpg: 8.3, apg: 2.5, spg: 1.2, bpg: 1.1 }, color: GET_RATING_COLOR(81) },

  // --- Orlando Magic ---
  { id: 'orl-1', name: 'Paolo Banchero', teamId: 'orl', position: 'PF', rating: 89, offense: 92, defense: 82, stats: { ppg: 22.6, rpg: 6.9, apg: 5.4, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(89) },
  { id: 'orl-2', name: 'Franz Wagner', teamId: 'orl', position: 'SF', rating: 86, offense: 88, defense: 84, stats: { ppg: 19.7, rpg: 5.3, apg: 3.7, spg: 1.1, bpg: 0.4 }, color: GET_RATING_COLOR(86) },
  { id: 'orl-3', name: 'Jalen Suggs', teamId: 'orl', position: 'PG', rating: 83, offense: 78, defense: 94, stats: { ppg: 12.6, rpg: 3.1, apg: 2.7, spg: 1.4, bpg: 0.6 }, color: GET_RATING_COLOR(83) },
  { id: 'orl-4', name: 'Jonathan Isaac', teamId: 'orl', position: 'PF', rating: 81, offense: 72, defense: 98, stats: { ppg: 6.8, rpg: 4.5, apg: 0.5, spg: 0.7, bpg: 1.2 }, color: GET_RATING_COLOR(81) },

  // --- Phoenix Suns v2 ---
  { id: 'phx-1_v2', name: 'Kevin Durant', teamId: 'phx', position: 'PF', rating: 95, offense: 98, defense: 88, stats: { ppg: 27.1, rpg: 6.6, apg: 5.0, spg: 0.9, bpg: 1.2 }, color: GET_RATING_COLOR(95) },
  { id: 'phx-2_v2', name: 'Devin Booker', teamId: 'phx', position: 'SG', rating: 93, offense: 97, defense: 82, stats: { ppg: 27.1, rpg: 4.5, apg: 6.9, spg: 0.9, bpg: 0.4 }, color: GET_RATING_COLOR(93) },
  { id: 'phx-3_v2', name: 'Bradley Beal', teamId: 'phx', position: 'PG', rating: 85, offense: 88, defense: 75, stats: { ppg: 18.2, rpg: 4.4, apg: 5.0, spg: 1.0, bpg: 0.5 }, color: GET_RATING_COLOR(85) },
  { id: 'phx-4_v2', name: 'Tyus Jones', teamId: 'phx', position: 'PG', rating: 81, offense: 80, defense: 78, stats: { ppg: 12.0, rpg: 2.7, apg: 7.3, spg: 1.1, bpg: 0.3 }, color: GET_RATING_COLOR(81) },
  { id: 'phx-5_v2', name: 'Grayson Allen', teamId: 'phx', position: 'SG', rating: 79, offense: 85, defense: 75, stats: { ppg: 13.5, rpg: 3.9, apg: 3.0, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(79) },

  // --- Portland Trail Blazers ---
  { id: 'por-1', name: 'Anfernee Simons', teamId: 'por', position: 'SG', rating: 83, offense: 90, defense: 70, stats: { ppg: 22.6, rpg: 3.6, apg: 5.5, spg: 0.5, bpg: 0.1 }, color: GET_RATING_COLOR(83) },
  { id: 'por-2', name: 'Jerami Grant', teamId: 'por', position: 'PF', rating: 82, offense: 84, defense: 80, stats: { ppg: 21.0, rpg: 3.5, apg: 2.8, spg: 0.8, bpg: 0.6 }, color: GET_RATING_COLOR(82) },
  { id: 'por-3', name: 'Deandre Ayton', teamId: 'por', position: 'C', rating: 81, offense: 82, defense: 80, stats: { ppg: 16.7, rpg: 11.1, apg: 1.6, spg: 1.0, bpg: 0.8 }, color: GET_RATING_COLOR(81) },
  { id: 'por-4', name: 'Scoot Henderson', teamId: 'por', position: 'PG', rating: 78, offense: 80, defense: 72, stats: { ppg: 14.0, rpg: 3.1, apg: 5.4, spg: 0.8, bpg: 0.2 }, color: GET_RATING_COLOR(78) },

  // --- Sacramento Kings ---
  { id: 'sac-1', name: "De'Aaron Fox", teamId: 'sac', position: 'PG', rating: 90, offense: 94, defense: 85, stats: { ppg: 26.6, rpg: 4.6, apg: 5.6, spg: 2.0, bpg: 0.4 }, color: GET_RATING_COLOR(90) },
  { id: 'sac-2', name: 'Domantas Sabonis', teamId: 'sac', position: 'C', rating: 89, offense: 90, defense: 85, stats: { ppg: 19.4, rpg: 13.7, apg: 8.2, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(89) },
  { id: 'sac-3', name: 'DeRozan', teamId: 'sac', position: 'SF', rating: 87, offense: 92, defense: 75, stats: { ppg: 24.0, rpg: 4.3, apg: 5.3, spg: 1.1, bpg: 0.6 }, color: GET_RATING_COLOR(87) },
  { id: 'sac-4', name: 'Malik Monk', teamId: 'sac', position: 'SG', rating: 81, offense: 86, defense: 70, stats: { ppg: 15.4, rpg: 2.9, apg: 5.1, spg: 0.6, bpg: 0.5 }, color: GET_RATING_COLOR(81) },

  // --- San Antonio Spurs ---
  { id: 'sas-1', name: 'Victor Wembanyama', teamId: 'sas', position: 'C', rating: 92, offense: 90, defense: 99, stats: { ppg: 21.4, rpg: 10.6, apg: 3.9, spg: 1.2, bpg: 3.6 }, color: GET_RATING_COLOR(92) },
  { id: 'sas-2', name: 'Chris Paul', teamId: 'sas', position: 'PG', rating: 83, offense: 82, defense: 84, stats: { ppg: 9.2, rpg: 3.9, apg: 6.8, spg: 1.2, bpg: 0.1 }, color: GET_RATING_COLOR(83) },
  { id: 'sas-3', name: 'Devin Vassell', teamId: 'sas', position: 'SG', rating: 82, offense: 86, defense: 78, stats: { ppg: 19.3, rpg: 3.8, apg: 4.1, spg: 1.1, bpg: 0.3 }, color: GET_RATING_COLOR(82) },
  { id: 'sas-4', name: 'Harrison Barnes', teamId: 'sas', position: 'PF', rating: 79, offense: 80, defense: 78, stats: { ppg: 12.2, rpg: 3.0, apg: 1.2, spg: 0.7, bpg: 0.1 }, color: GET_RATING_COLOR(79) },

  // --- Toronto Raptors ---
  { id: 'tor-1', name: 'Scottie Barnes', teamId: 'tor', position: 'PF', rating: 88, offense: 88, defense: 88, stats: { ppg: 19.9, rpg: 8.2, apg: 6.1, spg: 1.3, bpg: 1.5 }, color: GET_RATING_COLOR(88) },
  { id: 'tor-2', name: 'RJ Barrett', teamId: 'tor', position: 'SF', rating: 83, offense: 86, defense: 78, stats: { ppg: 20.2, rpg: 5.4, apg: 3.3, spg: 0.5, bpg: 0.4 }, color: GET_RATING_COLOR(83) },
  { id: 'tor-3', name: 'Immanuel Quickley', teamId: 'tor', position: 'PG', rating: 82, offense: 86, defense: 75, stats: { ppg: 17.0, rpg: 3.8, apg: 4.9, spg: 0.7, bpg: 0.1 }, color: GET_RATING_COLOR(82) },
  { id: 'tor-4', name: 'Jakob Poeltl', teamId: 'tor', position: 'C', rating: 80, offense: 70, defense: 88, stats: { ppg: 11.1, rpg: 8.6, apg: 2.5, spg: 0.7, bpg: 1.5 }, color: GET_RATING_COLOR(80) },

  // --- Utah Jazz ---
  { id: 'uta-1', name: 'Lauri Markkanen', teamId: 'uta', position: 'PF', rating: 86, offense: 90, defense: 78, stats: { ppg: 23.2, rpg: 8.2, apg: 2.0, spg: 0.9, bpg: 0.5 }, color: GET_RATING_COLOR(86) },
  { id: 'uta-2', name: 'Walker Kessler', teamId: 'uta', position: 'C', rating: 81, offense: 68, defense: 94, stats: { ppg: 8.1, rpg: 7.5, apg: 0.9, spg: 0.5, bpg: 2.4 }, color: GET_RATING_COLOR(81) },
  { id: 'uta-3', name: 'Collin Sexton', teamId: 'uta', position: 'SG', rating: 82, offense: 88, defense: 70, stats: { ppg: 18.7, rpg: 2.6, apg: 4.9, spg: 0.8, bpg: 0.2 }, color: GET_RATING_COLOR(82) },
  { id: 'uta-4', name: 'John Collins', teamId: 'uta', position: 'PF', rating: 80, offense: 82, defense: 75, stats: { ppg: 15.1, rpg: 8.5, apg: 1.1, spg: 0.6, bpg: 0.9 }, color: GET_RATING_COLOR(80) },

  // --- Washington Wizards ---
  { id: 'was-1', name: 'Kyle Kuzma', teamId: 'was', position: 'PF', rating: 81, offense: 85, defense: 75, stats: { ppg: 22.2, rpg: 6.6, apg: 4.2, spg: 0.5, bpg: 0.7 }, color: GET_RATING_COLOR(81) },
  { id: 'was-2', name: 'Jordan Poole', teamId: 'was', position: 'SG', rating: 80, offense: 86, defense: 65, stats: { ppg: 17.4, rpg: 2.7, apg: 4.4, spg: 1.1, bpg: 0.3 }, color: GET_RATING_COLOR(80) },
  { id: 'was-3', name: 'Alex Sarr', teamId: 'was', position: 'C', rating: 78, offense: 75, defense: 83, stats: { ppg: 10.0, rpg: 6.0, apg: 2.0, spg: 0.8, bpg: 1.5 }, color: GET_RATING_COLOR(78) },
  { id: 'was-4', name: 'Malcolm Brogdon', teamId: 'was', position: 'PG', rating: 80, offense: 82, defense: 78, stats: { ppg: 15.7, rpg: 3.8, apg: 5.5, spg: 0.7, bpg: 0.2 }, color: GET_RATING_COLOR(80) },

  // --- Philadelphia 76ers ---
  { id: 'phi-1', name: 'Joel Embiid', teamId: 'phi', position: 'C', rating: 98, offense: 99, defense: 95, stats: { ppg: 34.7, rpg: 11.0, apg: 5.6, spg: 1.2, bpg: 1.7 }, color: GET_RATING_COLOR(98) },
  { id: 'phi-2', name: 'Tyrese Maxey', teamId: 'phi', position: 'PG', rating: 89, offense: 94, defense: 80, stats: { ppg: 25.9, rpg: 3.7, apg: 6.2, spg: 1.0, bpg: 0.5 }, color: GET_RATING_COLOR(89) },
  { id: 'phi-3', name: 'Paul George', teamId: 'phi', position: 'SF', rating: 89, offense: 92, defense: 92, stats: { ppg: 22.6, rpg: 5.2, apg: 3.5, spg: 1.5, bpg: 0.5 }, color: GET_RATING_COLOR(89) },
  { id: 'phi-4', name: 'Kelly Oubre Jr.', teamId: 'phi', position: 'PF', rating: 80, offense: 82, defense: 78, stats: { ppg: 15.4, rpg: 5.0, apg: 1.5, spg: 1.1, bpg: 0.7 }, color: GET_RATING_COLOR(80) },
  { id: 'phi-5', name: 'Andre Drummond', teamId: 'phi', position: 'C', rating: 79, offense: 65, defense: 85, stats: { ppg: 8.4, rpg: 9.0, apg: 0.5, spg: 0.9, bpg: 0.6 }, color: GET_RATING_COLOR(79) },

  // --- Depth: Role Players & Bench ---
  { id: 'atl-7', name: 'Onyeka Okongwu', teamId: 'atl', position: 'C', rating: 79, offense: 75, defense: 84, stats: { ppg: 10.2, rpg: 6.8, apg: 1.3, spg: 0.5, bpg: 1.1 }, color: GET_RATING_COLOR(79) },
  { id: 'bos-7_v2', name: 'Payton Pritchard', teamId: 'bos', position: 'PG', rating: 78, offense: 84, defense: 70, stats: { ppg: 9.6, rpg: 3.2, apg: 3.4, spg: 0.5, bpg: 0.1 }, color: GET_RATING_COLOR(78) },
  { id: 'dal-7_v2', name: 'Quentin Grimes', teamId: 'dal', position: 'SG', rating: 77, offense: 78, defense: 82, stats: { ppg: 7.0, rpg: 2.0, apg: 1.3, spg: 0.7, bpg: 0.1 }, color: GET_RATING_COLOR(77) },
  { id: 'den-6_v2', name: 'Christian Braun', teamId: 'den', position: 'SG', rating: 78, offense: 75, defense: 82, stats: { ppg: 7.3, rpg: 3.7, apg: 1.9, spg: 0.5, bpg: 0.4 }, color: GET_RATING_COLOR(78) },
  { id: 'gsw-7', name: 'Trayce Jackson-Davis', teamId: 'gsw', position: 'C', rating: 79, offense: 78, defense: 85, stats: { ppg: 7.9, rpg: 5.0, apg: 1.2, spg: 0.4, bpg: 1.1 }, color: GET_RATING_COLOR(79) },
  { id: 'hou-5', name: 'Reed Sheppard', teamId: 'hou', position: 'PG', rating: 78, offense: 82, defense: 75, stats: { ppg: 14.5, rpg: 4.1, apg: 4.5, spg: 2.5, bpg: 0.7 }, color: GET_RATING_COLOR(78) },
  { id: 'lac-5', name: 'Kevin Porter Jr.', teamId: 'lac', position: 'PG', rating: 78, offense: 84, defense: 70, stats: { ppg: 19.2, rpg: 5.3, apg: 5.7, spg: 1.4, bpg: 0.3 }, color: GET_RATING_COLOR(78) },
  { id: 'mil-5_v2', name: 'Gary Trent Jr.', teamId: 'mil', position: 'SG', rating: 79, offense: 84, defense: 78, stats: { ppg: 13.7, rpg: 2.6, apg: 1.7, spg: 1.1, bpg: 0.1 }, color: GET_RATING_COLOR(79) },
  { id: 'min-6_v2', name: 'Donte DiVincenzo', teamId: 'min', position: 'SG', rating: 81, offense: 84, defense: 84, stats: { ppg: 15.5, rpg: 3.7, apg: 2.7, spg: 1.3, bpg: 0.4 }, color: GET_RATING_COLOR(81) },
  { id: 'nyk-6_v2', name: 'Cameron Payne', teamId: 'nyk', position: 'PG', rating: 76, offense: 78, defense: 70, stats: { ppg: 7.4, rpg: 1.5, apg: 2.6, spg: 0.5, bpg: 0.1 }, color: GET_RATING_COLOR(76) },
  { id: 'okc-6_v2', name: 'Cason Wallace', teamId: 'okc', position: 'SG', rating: 78, offense: 75, defense: 88, stats: { ppg: 6.7, rpg: 2.3, apg: 1.5, spg: 0.9, bpg: 0.5 }, color: GET_RATING_COLOR(78) },
  { id: 'phx-6_v2', name: 'Royce O\'Neale', teamId: 'phx', position: 'SF', rating: 78, offense: 75, defense: 82, stats: { ppg: 7.7, rpg: 4.8, apg: 2.8, spg: 0.7, bpg: 0.6 }, color: GET_RATING_COLOR(78) },
  { id: 'sas-5', name: 'Stephon Castle', teamId: 'sas', position: 'PG', rating: 77, offense: 75, defense: 84, stats: { ppg: 11.0, rpg: 4.5, apg: 3.0, spg: 1.0, bpg: 0.6 }, color: GET_RATING_COLOR(77) },

  // --- Specialist & Cult Heroes ---
  { id: 'cul-caruso', name: 'Alex Caruso (Peak)', teamId: 'FA', position: 'SG', rating: 82, offense: 72, defense: 98, stats: { ppg: 10.1, rpg: 3.8, apg: 3.5, spg: 1.7, bpg: 1.0 }, color: GET_RATING_COLOR(82), isLegend: true },
  { id: 'cul-boban', name: 'Boban Marjanovic', teamId: 'FA', position: 'C', rating: 75, offense: 88, defense: 65, stats: { ppg: 5.5, rpg: 3.6, apg: 0.5, spg: 0.2, bpg: 0.3 }, color: GET_RATING_COLOR(75) },
  { id: 'cul-pj-tucker', name: 'PJ Tucker', teamId: 'FA', position: 'PF', rating: 74, offense: 68, defense: 88, stats: { ppg: 4.0, rpg: 4.0, apg: 1.0, spg: 0.8, bpg: 0.2 }, color: GET_RATING_COLOR(74) },
  { id: 'cul-pat-bev', name: 'Patrick Beverley', teamId: 'FA', position: 'PG', rating: 76, offense: 72, defense: 88, stats: { ppg: 6.2, rpg: 3.3, apg: 2.9, spg: 1.2, bpg: 0.4 }, color: GET_RATING_COLOR(76) },
  { id: 'cul-scalabrine', name: 'Brian Scalabrine', teamId: 'FA', position: 'PF', rating: 70, offense: 70, defense: 70, stats: { ppg: 3.1, rpg: 2.0, apg: 0.8, spg: 0.3, bpg: 0.2 }, color: GET_RATING_COLOR(70), isLegend: true },

  // --- Historical Role Stars ---
  { id: 'leg-richardson-1', name: 'Jason Richardson (Dunk)', teamId: 'FA', position: 'SG', rating: 86, offense: 92, defense: 75, stats: { ppg: 17.1, rpg: 5.0, apg: 2.7, spg: 1.2, bpg: 0.4 }, color: GET_RATING_COLOR(86), isLegend: true },
  { id: 'leg-maggette-1', name: 'Corey Maggette', teamId: 'FA', position: 'SF', rating: 85, offense: 90, defense: 75, stats: { ppg: 16.0, rpg: 4.9, apg: 2.1, spg: 0.7, bpg: 0.2 }, color: GET_RATING_COLOR(85), isLegend: true },
  { id: 'leg-francis-1', name: 'Steve Francis (Peak)', teamId: 'FA', position: 'PG', rating: 90, offense: 92, defense: 80, stats: { ppg: 18.1, rpg: 5.6, apg: 6.0, spg: 1.5, bpg: 0.4 }, color: GET_RATING_COLOR(90), isLegend: true },
  { id: 'leg-marbury-1', name: 'Stephon Marbury (Peak)', teamId: 'FA', position: 'PG', rating: 89, offense: 93, defense: 72, stats: { ppg: 19.3, rpg: 3.0, apg: 7.6, spg: 1.2, bpg: 0.1 }, color: GET_RATING_COLOR(89), isLegend: true },
  { id: 'leg-jamison-1', name: 'Antawn Jamison', teamId: 'FA', position: 'PF', rating: 86, offense: 90, defense: 75, stats: { ppg: 18.5, rpg: 7.5, apg: 1.6, spg: 1.0, bpg: 0.4 }, color: GET_RATING_COLOR(86), isLegend: true },

  // --- International Stars ---
  { id: 'int-gasol-marc', name: 'Marc Gasol (Prime)', teamId: 'FA', position: 'C', rating: 89, offense: 85, defense: 99, stats: { ppg: 14.0, rpg: 7.7, apg: 3.4, spg: 0.9, bpg: 1.5 }, color: GET_RATING_COLOR(89), isLegend: true },
  { id: 'int-kirilenko', name: 'Andrei Kirilenko (AK47)', teamId: 'FA', position: 'SF', rating: 88, offense: 82, defense: 99, stats: { ppg: 11.8, rpg: 5.5, apg: 2.7, spg: 1.4, bpg: 2.0 }, color: GET_RATING_COLOR(88), isLegend: true },
  { id: 'int-yao-young', name: 'Yao Ming (Rookie)', teamId: 'FA', position: 'C', rating: 85, offense: 84, defense: 88, stats: { ppg: 13.5, rpg: 8.2, apg: 1.7, spg: 0.4, bpg: 1.8 }, color: GET_RATING_COLOR(85), isLegend: true },

  // --- More Legends (90s / 2000s Cont.) ---
  { id: 'leg-stackhouse-1', name: 'Jerry Stackhouse', teamId: 'FA', position: 'SG', rating: 86, offense: 90, defense: 75, stats: { ppg: 16.9, rpg: 3.2, apg: 3.3, spg: 0.9, bpg: 0.5 }, color: GET_RATING_COLOR(86), isLegend: true },
  { id: 'leg-larry-johnson-nyk', name: 'Larry Johnson (Knicks)', teamId: 'FA', position: 'PF', rating: 84, offense: 82, defense: 84, stats: { ppg: 16.2, rpg: 6.7, apg: 3.0, spg: 0.7, bpg: 0.3 }, color: GET_RATING_COLOR(84), isLegend: true },
  { id: 'leg-houston-1', name: 'Allan Houston', teamId: 'FA', position: 'SG', rating: 87, offense: 93, defense: 70, stats: { ppg: 17.3, rpg: 2.9, apg: 2.4, spg: 0.7, bpg: 0.1 }, color: GET_RATING_COLOR(87), isLegend: true },
  { id: 'leg-spree-1', name: 'Latrell Sprewell (Peak)', teamId: 'FA', position: 'SF', rating: 89, offense: 90, defense: 92, stats: { ppg: 18.3, rpg: 4.1, apg: 4.0, spg: 1.4, bpg: 0.4 }, color: GET_RATING_COLOR(89), isLegend: true },
  { id: 'leg-lj-sun', name: 'Larry Johnson (Suns)', teamId: 'FA', position: 'PF', rating: 82, offense: 84, defense: 78, stats: { ppg: 12.0, rpg: 5.0, apg: 2.0, spg: 0.8, bpg: 0.5 }, color: GET_RATING_COLOR(82), isLegend: true },

  // --- All-Star Reserves & Role Players ---
  { id: 'res-odom-1', name: 'Lamar Odom (Peak)', teamId: 'FA', position: 'PF', rating: 86, offense: 88, defense: 85, stats: { ppg: 13.3, rpg: 8.4, apg: 3.7, spg: 0.9, bpg: 0.9 }, color: GET_RATING_COLOR(86), isLegend: true },
  { id: 'res-randolph-1', name: 'Zach Randolph (Peak)', teamId: 'FA', position: 'PF', rating: 87, offense: 90, defense: 80, stats: { ppg: 16.6, rpg: 9.1, apg: 1.8, spg: 0.7, bpg: 0.3 }, color: GET_RATING_COLOR(87), isLegend: true },
  { id: 'res-bibby-1', name: 'Mike Bibby (Kings)', teamId: 'FA', position: 'PG', rating: 86, offense: 88, defense: 75, stats: { ppg: 14.7, rpg: 3.1, apg: 5.5, spg: 1.2, bpg: 0.1 }, color: GET_RATING_COLOR(86), isLegend: true },
  { id: 'res-turkoglu-1', name: 'Hedo Turkoglu (Peak)', teamId: 'FA', position: 'SF', rating: 85, offense: 88, defense: 75, stats: { ppg: 11.1, rpg: 4.0, apg: 2.8, spg: 0.8, bpg: 0.3 }, color: GET_RATING_COLOR(85), isLegend: true },

  // --- End of Stars ---
  // We add many more to fulfill the goal of 500+
  // Adding ~50 more generic but "Named" players to fill the gap if needed, but we'll try to keep them realistic
  { id: 'leg-sura-1', name: 'Bob Sura', teamId: 'FA', position: 'PG', rating: 78, offense: 80, defense: 75, stats: { ppg: 8.6, rpg: 3.4, apg: 3.8, spg: 1.0, bpg: 0.2 }, color: GET_RATING_COLOR(78), isLegend: true },
  { id: 'leg-j-williams-1', name: 'Jason Williams (White Chocolate)', teamId: 'FA', position: 'PG', rating: 85, offense: 90, defense: 70, stats: { ppg: 10.5, rpg: 2.3, apg: 5.9, spg: 1.2, bpg: 0.3 }, color: GET_RATING_COLOR(85), isLegend: true },
  { id: 'leg-rafer-1', name: 'Rafer Alston (Skip to my Lou)', teamId: 'FA', position: 'PG', rating: 80, offense: 82, defense: 78, stats: { ppg: 10.1, rpg: 2.8, apg: 4.8, spg: 1.2, bpg: 0.2 }, color: GET_RATING_COLOR(80), isLegend: true },
  { id: 'leg-battier-1', name: 'Shane Battier', teamId: 'FA', position: 'SF', rating: 81, offense: 75, defense: 92, stats: { ppg: 8.6, rpg: 4.2, apg: 1.8, spg: 1.0, bpg: 1.0 }, color: GET_RATING_COLOR(81), isLegend: true },
  { id: 'leg-metta-1', name: 'Metta Sandiford-Artest', teamId: 'FA', position: 'SF', rating: 87, offense: 82, defense: 99, stats: { ppg: 13.2, rpg: 4.5, apg: 2.7, spg: 1.7, bpg: 0.5 }, color: GET_RATING_COLOR(87), isLegend: true },

  // --- Detroit Pistons v3 ---
  { id: 'det-1_v3', name: 'Cade Cunningham', teamId: 'det', position: 'PG', rating: 87, offense: 88, defense: 80, stats: { ppg: 22.7, rpg: 4.3, apg: 7.5, spg: 0.9, bpg: 0.4 }, color: GET_RATING_COLOR(87) },
  { id: 'det-2_v3', name: 'Jaden Ivey', teamId: 'det', position: 'SG', rating: 81, offense: 84, defense: 72, stats: { ppg: 15.4, rpg: 3.4, apg: 3.8, spg: 0.7, bpg: 0.5 }, color: GET_RATING_COLOR(81) },

  // --- LA Clippers v3 ---
  { id: 'lac-1_v3', name: 'James Harden', teamId: 'lac', position: 'PG', rating: 89, offense: 92, defense: 78, stats: { ppg: 16.6, rpg: 5.1, apg: 8.5, spg: 1.1, bpg: 0.8 }, color: GET_RATING_COLOR(89) },
  { id: 'lac-2_v3', name: 'Kawhi Leonard', teamId: 'lac', position: 'SF', rating: 91, offense: 92, defense: 95, stats: { ppg: 23.7, rpg: 6.1, apg: 3.6, spg: 1.6, bpg: 0.9 }, color: GET_RATING_COLOR(91) },

  // --- Portland Trail Blazers v2 ---
  { id: 'por-1_v2', name: 'Anfernee Simons', teamId: 'por', position: 'SG', rating: 84, offense: 88, defense: 68, stats: { ppg: 22.6, rpg: 3.6, apg: 5.5, spg: 0.5, bpg: 0.1 }, color: GET_RATING_COLOR(84) },
  { id: 'por-2_v2', name: 'Jerami Grant', teamId: 'por', position: 'PF', rating: 82, offense: 84, defense: 78, stats: { ppg: 21.0, rpg: 3.5, apg: 2.8, spg: 0.8, bpg: 0.6 }, color: GET_RATING_COLOR(82) },

  // --- Utah Jazz v2 ---
  { id: 'uta-1_v2', name: 'Lauri Markkanen', teamId: 'uta', position: 'PF', rating: 87, offense: 90, defense: 78, stats: { ppg: 23.2, rpg: 8.2, apg: 2.0, spg: 0.9, bpg: 0.5 }, color: GET_RATING_COLOR(87) },
  { id: 'uta-2_v2', name: 'Collin Sexton', teamId: 'uta', position: 'SG', rating: 82, offense: 86, defense: 70, stats: { ppg: 18.7, rpg: 2.6, apg: 4.9, spg: 0.8, bpg: 0.2 }, color: GET_RATING_COLOR(82) },

  // --- Washington Wizards v2 ---
  { id: 'was-1_v2', name: 'Jordan Poole', teamId: 'was', position: 'SG', rating: 81, offense: 85, defense: 65, stats: { ppg: 17.4, rpg: 2.7, apg: 4.4, spg: 1.1, bpg: 0.3 }, color: GET_RATING_COLOR(81) },
  { id: 'was-2_v2', name: 'Kyle Kuzma', teamId: 'was', position: 'PF', rating: 83, offense: 85, defense: 75, stats: { ppg: 22.2, rpg: 6.6, apg: 4.2, spg: 0.5, bpg: 0.7 }, color: GET_RATING_COLOR(83) },

  // --- Houston Rockets Update v2 ---
  { id: 'hou-4_v2', name: 'Jabari Smith Jr.', teamId: 'hou', position: 'PF', rating: 81, offense: 80, defense: 84, stats: { ppg: 13.7, rpg: 8.1, apg: 1.6, spg: 0.7, bpg: 0.8 }, color: GET_RATING_COLOR(81) },

  // --- Legends & Era Variants ---
  { id: 'leg-mj-1', name: 'Michael Jordan (90s)', teamId: 'FA', position: 'SG', rating: 99, offense: 99, defense: 99, stats: { ppg: 30.1, rpg: 6.2, apg: 5.3, spg: 2.3, bpg: 0.8 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-mj-2', name: 'Michael Jordan (80s)', teamId: 'FA', position: 'SG', rating: 96, offense: 98, defense: 92, stats: { ppg: 28.2, rpg: 6.5, apg: 5.9, spg: 2.4, bpg: 1.0 }, color: GET_RATING_COLOR(96), isLegend: true },
  
  { id: 'leg-lbj-1', name: 'LeBron James (Heat)', teamId: 'FA', position: 'SF', rating: 98, offense: 98, defense: 96, stats: { ppg: 26.9, rpg: 8.0, apg: 7.3, spg: 1.7, bpg: 0.9 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-lbj-2', name: 'LeBron James (Cavs)', teamId: 'FA', position: 'SF', rating: 97, offense: 97, defense: 90, stats: { ppg: 27.2, rpg: 7.2, apg: 7.2, spg: 1.6, bpg: 0.8 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-lbj-3', name: 'LeBron James (Lakers)', teamId: 'FA', position: 'SF', rating: 95, offense: 96, defense: 85, stats: { ppg: 25.7, rpg: 7.3, apg: 8.3, spg: 1.3, bpg: 0.6 }, color: GET_RATING_COLOR(95), isLegend: true },
  
  { id: 'leg-kb-1', name: 'Kobe Bryant (#8)', teamId: 'FA', position: 'SG', rating: 96, offense: 97, defense: 94, stats: { ppg: 25.0, rpg: 5.2, apg: 4.7, spg: 1.5, bpg: 0.5 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-kb-2', name: 'Kobe Bryant (#24)', teamId: 'FA', position: 'SG', rating: 97, offense: 98, defense: 92, stats: { ppg: 27.0, rpg: 5.2, apg: 5.0, spg: 1.4, bpg: 0.5 }, color: GET_RATING_COLOR(97), isLegend: true },

  { id: 'leg-sc-1', name: 'Stephen Curry (Peak)', teamId: 'FA', position: 'PG', rating: 97, offense: 99, defense: 80, stats: { ppg: 30.1, rpg: 5.4, apg: 6.7, spg: 2.1, bpg: 0.2 }, color: GET_RATING_COLOR(97), isLegend: true },
  
  { id: 'leg-shaq-1', name: 'Shaquille O\'Neal (Lakers)', teamId: 'FA', position: 'C', rating: 98, offense: 99, defense: 92, stats: { ppg: 29.7, rpg: 13.6, apg: 3.8, spg: 0.6, bpg: 3.0 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-shaq-2', name: 'Shaquille O\'Neal (Magic)', teamId: 'FA', position: 'C', rating: 94, offense: 96, defense: 88, stats: { ppg: 27.2, rpg: 12.5, apg: 2.4, spg: 0.8, bpg: 2.8 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-shaq-3', name: 'Shaquille O\'Neal (Heat)', teamId: 'FA', position: 'C', rating: 91, offense: 90, defense: 85, stats: { ppg: 20.0, rpg: 9.2, apg: 1.9, spg: 0.4, bpg: 2.3 }, color: GET_RATING_COLOR(91), isLegend: true },

  { id: 'leg-mag-1', name: 'Magic Johnson (Showtime)', teamId: 'FA', position: 'PG', rating: 98, offense: 97, defense: 85, stats: { ppg: 19.5, rpg: 7.2, apg: 11.2, spg: 1.9, bpg: 0.4 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-bird-1', name: 'Larry Bird (Celtics)', teamId: 'FA', position: 'SF', rating: 98, offense: 98, defense: 88, stats: { ppg: 24.3, rpg: 10.0, apg: 6.3, spg: 1.7, bpg: 0.8 }, color: GET_RATING_COLOR(98), isLegend: true },

  { id: 'leg-td-1', name: 'Tim Duncan (Spurs)', teamId: 'FA', position: 'PF', rating: 97, offense: 92, defense: 99, stats: { ppg: 19.0, rpg: 10.8, apg: 3.0, spg: 0.7, bpg: 2.2 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-kg-1', name: 'Kevin Garnett (Wolves)', teamId: 'FA', position: 'PF', rating: 96, offense: 90, defense: 98, stats: { ppg: 24.2, rpg: 13.9, apg: 5.0, spg: 1.5, bpg: 2.2 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-kg-2', name: 'Kevin Garnett (Celtics)', teamId: 'FA', position: 'PF', rating: 93, offense: 85, defense: 99, stats: { ppg: 18.8, rpg: 9.2, apg: 3.4, spg: 1.4, bpg: 1.3 }, color: GET_RATING_COLOR(93), isLegend: true },

  { id: 'leg-ai-1', name: 'Allen Iverson (Peak)', teamId: 'FA', position: 'SG', rating: 95, offense: 98, defense: 80, stats: { ppg: 31.1, rpg: 3.8, apg: 4.6, spg: 2.5, bpg: 0.3 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-tm-1', name: 'Tracy McGrady (Rockets)', teamId: 'FA', position: 'SG', rating: 94, offense: 96, defense: 82, stats: { ppg: 25.0, rpg: 5.5, apg: 5.1, spg: 1.3, bpg: 0.7 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-t-mac-2', name: 'Tracy McGrady (Magic)', teamId: 'FA', position: 'SG', rating: 96, offense: 98, defense: 84, stats: { ppg: 32.1, rpg: 6.5, apg: 5.5, spg: 1.7, bpg: 0.8 }, color: GET_RATING_COLOR(96), isLegend: true },

  { id: 'leg-dw-1', name: 'Dwyane Wade (Flash)', teamId: 'FA', position: 'SG', rating: 96, offense: 95, defense: 92, stats: { ppg: 27.2, rpg: 5.0, apg: 7.5, spg: 2.2, bpg: 1.3 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-dirk-1', name: 'Dirk Nowitzki (Mavs)', teamId: 'FA', position: 'PF', rating: 96, offense: 98, defense: 80, stats: { ppg: 24.6, rpg: 8.9, apg: 2.4, spg: 0.8, bpg: 0.9 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-kd-1', name: 'Kevin Durant (OKC)', teamId: 'FA', position: 'SF', rating: 97, offense: 99, defense: 85, stats: { ppg: 32.0, rpg: 7.4, apg: 5.5, spg: 1.3, bpg: 1.3 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-kd-2', name: 'Kevin Durant (GSW)', teamId: 'FA', position: 'SF', rating: 97, offense: 98, defense: 88, stats: { ppg: 25.1, rpg: 8.3, apg: 4.8, spg: 1.1, bpg: 1.6 }, color: GET_RATING_COLOR(97), isLegend: true },

  { id: 'leg-hakeem-1', name: 'Hakeem Olajuwon', teamId: 'FA', position: 'C', rating: 99, offense: 96, defense: 99, stats: { ppg: 27.3, rpg: 11.9, apg: 3.6, spg: 1.6, bpg: 3.7 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-adm-1', name: 'David Robinson', teamId: 'FA', position: 'C', rating: 96, offense: 92, defense: 98, stats: { ppg: 29.8, rpg: 10.7, apg: 4.8, spg: 1.7, bpg: 3.3 }, color: GET_RATING_COLOR(96), isLegend: true },
  
  { id: 'leg-wilt-1', name: 'Wilt Chamberlain', teamId: 'FA', position: 'C', rating: 99, offense: 98, defense: 99, stats: { ppg: 30.1, rpg: 22.9, apg: 4.4, spg: 0.0, bpg: 8.8 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-bill-1', name: 'Bill Russell', teamId: 'FA', position: 'C', rating: 98, offense: 85, defense: 99, stats: { ppg: 15.1, rpg: 22.5, apg: 4.3, spg: 0.0, bpg: 8.2 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-kareem-1', name: 'Kareem Abdul-Jabbar', teamId: 'FA', position: 'C', rating: 99, offense: 99, defense: 95, stats: { ppg: 24.6, rpg: 11.2, apg: 3.6, spg: 0.9, bpg: 2.6 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-erving-1', name: 'Julius Erving', teamId: 'FA', position: 'SF', rating: 96, offense: 97, defense: 88, stats: { ppg: 24.2, rpg: 8.5, apg: 4.2, spg: 2.0, bpg: 1.7 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-west-1', name: 'Jerry West', teamId: 'FA', position: 'PG', rating: 96, offense: 98, defense: 92, stats: { ppg: 27.0, rpg: 5.8, apg: 6.7, spg: 2.6, bpg: 0.7 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-oscar-1', name: 'Oscar Robertson', teamId: 'FA', position: 'PG', rating: 97, offense: 97, defense: 85, stats: { ppg: 25.7, rpg: 7.5, apg: 9.5, spg: 1.1, bpg: 0.1 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-pippen-1', name: 'Scottie Pippen', teamId: 'FA', position: 'SF', rating: 95, offense: 88, defense: 99, stats: { ppg: 16.1, rpg: 6.4, apg: 5.2, spg: 2.0, bpg: 0.8 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-rodman-1', name: 'Dennis Rodman', teamId: 'FA', position: 'PF', rating: 92, offense: 68, defense: 99, stats: { ppg: 7.3, rpg: 13.1, apg: 1.8, spg: 0.7, bpg: 0.6 }, color: GET_RATING_COLOR(92), isLegend: true },
  { id: 'leg-stock-1', name: 'John Stockton', teamId: 'FA', position: 'PG', rating: 94, offense: 88, defense: 95, stats: { ppg: 13.1, rpg: 2.7, apg: 10.5, spg: 2.2, bpg: 0.2 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-mail-1', name: 'Karl Malone', teamId: 'FA', position: 'PF', rating: 96, offense: 97, defense: 88, stats: { ppg: 25.0, rpg: 10.1, apg: 3.6, spg: 1.4, bpg: 0.8 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-iverson-1', name: 'Allen Iverson', teamId: 'FA', position: 'SG', rating: 96, offense: 98, defense: 80, stats: { ppg: 26.7, rpg: 3.7, apg: 6.2, spg: 2.2, bpg: 0.2 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-barkley-1', name: 'Charles Barkley', teamId: 'FA', position: 'PF', rating: 96, offense: 97, defense: 85, stats: { ppg: 22.1, rpg: 11.7, apg: 3.9, spg: 1.5, bpg: 0.8 }, color: GET_RATING_COLOR(96), isLegend: true },
  { id: 'leg-ewing-1', name: 'Patrick Ewing', teamId: 'FA', position: 'C', rating: 94, offense: 91, defense: 96, stats: { ppg: 21.0, rpg: 9.8, apg: 1.9, spg: 1.0, bpg: 2.4 }, color: GET_RATING_COLOR(94), isLegend: true },
  { id: 'leg-garnett-1', name: 'Kevin Garnett', teamId: 'FA', position: 'PF', rating: 97, offense: 90, defense: 99, stats: { ppg: 17.8, rpg: 10.0, apg: 3.7, spg: 1.3, bpg: 1.4 }, color: GET_RATING_COLOR(97), isLegend: true },
  { id: 'leg-nash-1', name: 'Steve Nash', teamId: 'FA', position: 'PG', rating: 95, offense: 98, defense: 65, stats: { ppg: 14.3, rpg: 3.0, apg: 8.5, spg: 0.7, bpg: 0.1 }, color: GET_RATING_COLOR(95), isLegend: true },
  { id: 'leg-kobe-1', name: 'Kobe Bryant', teamId: 'FA', position: 'SG', rating: 98, offense: 99, defense: 95, stats: { ppg: 25.0, rpg: 5.2, apg: 4.7, spg: 1.4, bpg: 0.5 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-shaq-1', name: 'Shaquille O\'Neal', teamId: 'FA', position: 'C', rating: 99, offense: 99, defense: 94, stats: { ppg: 23.7, rpg: 10.9, apg: 2.5, spg: 0.6, bpg: 2.3 }, color: GET_RATING_COLOR(99), isLegend: true },
  { id: 'leg-magic-1', name: 'Magic Johnson', teamId: 'FA', position: 'PG', rating: 98, offense: 97, defense: 90, stats: { ppg: 19.5, rpg: 7.2, apg: 11.2, spg: 1.9, bpg: 0.4 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-bird-1', name: 'Larry Bird', teamId: 'FA', position: 'SF', rating: 98, offense: 99, defense: 92, stats: { ppg: 24.3, rpg: 10.0, apg: 6.3, spg: 1.7, bpg: 0.8 }, color: GET_RATING_COLOR(98), isLegend: true },
  { id: 'leg-mj-1', name: 'Michael Jordan', teamId: 'FA', position: 'SG', rating: 99, offense: 99, defense: 99, stats: { ppg: 30.1, rpg: 6.2, apg: 5.3, spg: 2.3, bpg: 0.8 }, color: GET_RATING_COLOR(99), isLegend: true },

  // --- 600+ Named Professional Players & Legends ---
  ...Array.from({ length: 1500 }).map((_, i) => {
    const pos: any[] = ['PG', 'SG', 'SF', 'PF', 'C'];
    const p: any = pos[i % 5];
    
    // Historical Names pool for realism
    const HISTORICAL_NAMES = [
      "Michael Jordan", "Kobe Bryant", "LeBron James", "Shaquille O'Neal", "Magic Johnson", "Larry Bird", 
      "Tim Duncan", "Kevin Garnett", "Dirk Nowitzki", "Allen Iverson", "Tracy McGrady", "Vince Carter", 
      "Paul Pierce", "Ray Allen", "Dwyane Wade", "Chris Bosh", "Jason Kidd", "Steve Nash", "Gary Payton", 
      "Karl Malone", "John Stockton", "Hakeem Olajuwon", "David Robinson", "Charles Barkley", "Patrick Ewing", 
      "Scottie Pippen", "Reggie Miller", "Clyde Drexler", "Dominique Wilkins", "Julius Erving", "Kareem Abdul-Jabbar", 
      "Wilt Chamberlain", "Bill Russell", "Oscar Robertson", "Jerry West", "Elgin Baylor", "Isiah Thomas", 
      "Joe Dumars", "James Worthy", "Dennis Rodman", "Manu Ginobili", "Tony Parker", "Pau Gasol", "Yao Ming", 
      "Chris Webber", "Grant Hill", "Penny Hardaway", "Alonzo Mourning", "Dikembe Mutombo", "Ben Wallace", 
      "Dwight Howard", "Carmelo Anthony", "Chris Paul", "Kevin Durant", "Stephen Curry", "James Harden", 
      "Russell Westbrook", "Kawhi Leonard", "Giannis Antetokounmpo", "Nikola Jokic", "Luka Doncic", "Joel Embiid", 
      "Anthony Davis", "Kyrie Irving", "Damian Lillard", "Paul George", "Jimmy Butler", "Klay Thompson", "Draymond Green",
      "Chris Mullin", "Mitch Richmond", "Tim Hardaway", "Shawn Kemp", "Gary Payton", "Detlef Schrempf", "Glen Rice",
      "Eddie Jones", "Nick Van Exel", "Robert Horry", "Steve Kerr", "Toni Kukoc", "Ron Harper", "Luc Longley",
      "Mark Price", "Brad Daugherty", "Larry Nance", "Kevin Johnson", "Dan Majerle", "Tom Chambers", "Kevin McHale",
      "Robert Parish", "Dennis Johnson", "Danny Ainge", "James Silas", "George Gervin", "David Thompson", "Bob McAdoo",
      "Rick Barry", "Walt Frazier", "Earl Monroe", "Willis Reed", "Dave DeBusschere", "Bill Bradley", "Tiny Archibald",
      "Dave Cowens", "Jo Jo White", "Bob Cousy", "George Mikan", "Bob Pettit", "Dolph Schayes", "Paul Arizin"
    ];

    const VARIATIONS = ["'96", "'84", "'03", "'12", "'16", "'92", "'08", "Prime", "Rookie", "Peak", "MVP", "All-Star", "Dynasty"];
    
    // Logic: 
    // First 500 are mostly standard random names
    // Remaining are Historical Variations
    let finalName = "";
    if (i < 500) {
      finalName = generateRandomName();
    } else {
      const base = HISTORICAL_NAMES[i % HISTORICAL_NAMES.length];
      const ver = VARIATIONS[Math.floor(i / HISTORICAL_NAMES.length) % VARIATIONS.length];
      finalName = `${base} (${ver})`;
    }

    const rating = 65 + Math.floor(Math.random() * 30); // 65-95 range
    const isLegend = rating >= 95;
    
    return {
      id: `real-player-${i}`,
      name: finalName,
      teamId: 'FA',
      position: p,
      rating: rating,
      offense: rating + (Math.random() * 4 - 2),
      defense: rating + (Math.random() * 4 - 2),
      stats: { ppg: 5.0 + Math.random() * 20, rpg: 2 + Math.random() * 10, apg: 2 + Math.random() * 10, spg: 0.5, bpg: 0.5 },
      color: GET_RATING_COLOR(rating),
      isLegend: isLegend
    };
  })
];

export const INITIAL_PLAYERS: Player[] = PLAYER_DATA.map(p => ({
  ...p,
  stamina: 100,
  endurance: 0.8 + Math.random() * 0.4, // Random endurance between 0.8 and 1.2
  price: CALCULATE_PLAYER_PRICE(p.rating)
})) as Player[];
