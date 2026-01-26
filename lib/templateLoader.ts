import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import EmailTemplateOverride from '@/models/EmailTemplateOverride';
import { dbConnect } from '@/lib/db';

const TEMPLATES_DIR = path.join(process.cwd(), 'emails', 'templates');
const DEFAULT_LOCALE = 'en';

async function loadFromFs(templateName: string, locale: string) {
  const base = path.join(TEMPLATES_DIR, templateName);
  const files: Record<string, string> = {
    subject: path.join(base, `${locale}.subject.txt`),
    html: path.join(base, `${locale}.html.hbs`),
    text: path.join(base, `${locale}.text.hbs`)
  };
  const out: any = {};
  for (const k of Object.keys(files)) {
    try {
      const s = await fs.readFile(files[k], 'utf8');
      out[k] = s;
    } catch (e) {
      // ignore missing; fallback
      out[k] = null;
    }
  }
  return out;
}

async function loadTemplate(templateName: string, locale: string) {
  locale = locale || DEFAULT_LOCALE;
  await dbConnect();

  // 1) Try DB override for exact locale
  const override = await EmailTemplateOverride.findOne({ templateName, locale }).lean() as any;
  if (override) return { subject: override.subject, html: override.html, text: override.text, source: 'db' };

  // 2) Load from FS for requested locale
  const fsLoc = await loadFromFs(templateName, locale);
  if (fsLoc.subject || fsLoc.html || fsLoc.text) return { subject: fsLoc.subject, html: fsLoc.html, text: fsLoc.text, source: 'fs' };

  // 3) Fallback to default locale (en)
  if (locale !== DEFAULT_LOCALE) {
    const fsDef = await loadFromFs(templateName, DEFAULT_LOCALE);
    return { subject: fsDef.subject, html: fsDef.html, text: fsDef.text, source: 'fs-fallback' };
  }

  return null;
}

// compile Handlebars templates, return rendered {subject, html, text}
function renderTemplates({ subject, html, text }: { subject: string; html: string; text: string }, vars = {}) {
  const result: any = { subject: '', html: '', text: '' };
  if (subject) result.subject = Handlebars.compile(subject)(vars);
  if (html) result.html = Handlebars.compile(html)(vars);
  if (text) result.text = Handlebars.compile(text)(vars);
  return result;
}

export { loadTemplate, renderTemplates };
