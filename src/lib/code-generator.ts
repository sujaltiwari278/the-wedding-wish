import { customAlphabet } from "nanoid";
import Couple from "@/models/Couple";
import { connectToDatabase } from "@/lib/mongodb";

// Unambiguous alphabet: 32 chars (omits 0, O, 1, I, L to prevent user confusion)
const UNAMBIGUOUS_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generateCode = customAlphabet(UNAMBIGUOUS_ALPHABET, 8);

/**
 * Generates an 8-character uppercase wedding code that does not collide
 */
export async function generateUniqueWeddingCode(): Promise<string> {
  await connectToDatabase();

  let code = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    code = generateCode();
    const existing = await Couple.findOne({ weddingCode: code }).select("_id").lean();
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    // Fallback timestamp mix
    code = `W${Date.now().toString(36).toUpperCase().slice(-7)}`;
  }

  return code;
}

/**
 * Creates a URL-friendly slug from partner names and checks for collision
 * Example: "Sujal", "Priya" -> "sujal-and-priya"
 */
export async function generateUniqueProfileSlug(
  partnerOne: string,
  partnerTwo: string
): Promise<string> {
  await connectToDatabase();

  const clean = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

  const baseSlug = `${clean(partnerOne)}-and-${clean(partnerTwo)}`;
  let slug = baseSlug;
  let counter = 1;

  while (await Couple.findOne({ profileSlug: slug }).select("_id").lean()) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}
