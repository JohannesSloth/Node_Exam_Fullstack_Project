export function classColour(flair) {
    switch (flair) {
      case "Death Knight":
        return "text-[#C41E3A]";
      case "Demon Hunter":
        return "text-[#A330C9]";
      case "Druid":
        return "text-[#FF7C0A]";
      case "Evoker":
        return "text-[#33937F]";
      case "Hunter":
        return "text-[#AAD372]";
      case "Mage":
        return "text-[#3FC7EB]";
      case "Monk":
        return "text-[#00FF98]";
      case "Paladin":
        return "text-[#F48CBA]";
      case "Priest":
        return "text-[#FFFFFF]";
      case "Rogue":
        return "text-[#FFF468]";
      case "Shaman":
        return "text-[#0070DD]";
      case "Warlock":
        return "text-[#8788EE]";
      case "Warrior":
        return "text-[#C69B6D]";
      case "MechaGnomeBot":
        return "text-[#cbd5e1]";
      default:
        return "text-black";
    }
  }