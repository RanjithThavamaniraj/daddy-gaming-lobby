// Central configuration for Daddy Gaming Lobby tournaments
// Update this file to configure the active tournament details and past champions list.

export const activeTournamentFallback = {
  id: "dgl-valorant-championship-1",
  title: "DGL Valorant Championship #1",
  game: "Valorant",
  format: "5v5",
  matchType: "Best of 3",
  prizePool: "₹1,000 Guaranteed",
  status: "Registration Open", // Status options: 'Registration Open', 'Registration Closed', 'Teams Finalized', 'Live', 'Completed'
  registrationLimit: 10,
  registrationDeadline: "June 25, 2026 11:59 PM",
  tournamentDate: "June 27, 2026 9:30 PM IST",
  accent: "#ff4655", // Cyberpunk visual accent color
};

export const pastChampions = [
  {
    id: "past-1",
    tournamentName: "DGL Valorant Alpha Cup",
    winningTeam: "Team Vipers",
    prizePool: "₹500",
    date: "May 15, 2026",
  },
  {
    id: "past-2",
    tournamentName: "DGL Apex Showdown",
    winningTeam: "Apex Predators",
    prizePool: "₹750",
    date: "June 02, 2026",
  },
];
