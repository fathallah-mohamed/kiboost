export const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  
  // Ajuster les mois si les jours sont négatifs
  if (days < 0) {
    months -= 1;
    // Ajouter les jours du mois précédent
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birth.getDate());
    days += Math.floor((today.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Ajuster les années si les mois sont négatifs
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  return { years, months, days };
};