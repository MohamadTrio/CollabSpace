// Warna-warna
const AVATAR_COLORS: { bg: string; text: string }[] = [
  { bg: "bg-blue-100",   text: "text-blue-700"   },
  { bg: "bg-purple-100", text: "text-purple-700"  },
  { bg: "bg-pink-100",   text: "text-pink-700"    },
  { bg: "bg-amber-100",  text: "text-amber-700"   },
  { bg: "bg-teal-100",   text: "text-teal-700"    },
  { bg: "bg-green-100",  text: "text-green-700"   },
  { bg: "bg-red-100",    text: "text-red-700"     },
  { bg: "bg-indigo-100", text: "text-indigo-700"  },
  { bg: "bg-orange-100", text: "text-orange-700"  },
  { bg: "bg-cyan-100",   text: "text-cyan-700"    },
];

// Warna konsisten berdasarkan nama/uid
export function getAvatarColor(seed: string): { bg: string; text: string } {
  const idx = seed
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

// Inisial — ambil 2 kata pertama saja
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)          // split per kata
    .slice(0, 2)           // ambil max 2 kata pertama
    .map((w) => w[0])      // ambil huruf pertama tiap kata
    .join("")
    .toUpperCase();
}