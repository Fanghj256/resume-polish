---
name: resume-polish
description: "Build a one-page Chinese A4 resume from real experience: resume wardrobe (记衣柜), JD breakdown, match scoring, browser-editable HTML and PDF, and pre-submission QA. Use for resume writing, role tailoring, old-resume updates, and application files."
when_to_use: Use when the user wants to write or revise a resume, update the resume wardrobe (记衣柜 / 衣柜体检), break down a JD, score experience match, generate or export a resume PDF / editable HTML (同步投递件), or run pre-submission QA (投递前质检).
metadata:
  version: "1.2.1"
  license: "MIT (original parts of this repo; reused upstream parts, see NOTICE.md)"
  repository: "https://github.com/Fanghj256/resume-polish"
---

# Resume Polish

**English** | [中文](SKILL.md)

> Reference translation of `SKILL.md`. The installed skill still reads `SKILL.md`; if the two versions disagree, `SKILL.md` is authoritative. To run the skill with English instructions, save this file as `SKILL.md` (or point your agent at this file).

Use the applicant's own material to produce a black-and-white, minimal, information-dense one-page A4 resume. The fixed visual comes from the [template](templates/resume.html); the content is tailored to the actual JD/HC and experience. The examples show layout only and are not a factual source for any applicant.

Starting from scratch or applying to a new role, follow the five steps in the [workflow](references/workflow.md): **build the resume wardrobe → break down the JD → score the match → generate the resume → pre-submission QA**. Prompts for all five stages are in the [prompt library](references/prompts.md). Before starting, check whether the user's data directory already has `简历衣柜/简历衣柜.md`; if so, take facts from it directly and do not re-ask about the experience.

**There are pause points between the five steps; do not run them all in one go.** After each step's output, stop and wait for the user's response before continuing. This is especially true at step ③, scoring: after producing the score sheet, **stop and wait for the user to tick "采用" (use) and set "简历顺序" (resume order)**. Do not decide the selection for the user, do not say "I suggest using these" and start, and **do not create or overwrite `制作源文件/简历.html` in advance** or export a PDF early. Only when the user explicitly says "you decide, don't ask me" may you decide yourself.

**Do not change things the user did not ask you to change.** Existing resumes and deliverables in the role folder may be touched only when the user asks; if you really need to overwrite, **copy a date-stamped backup first** (the backup must be made before the change) and explain in your reply what changed.

## Intake

- Read [Intake and follow-up questions](references/intake-and-follow-up.md) first. Check the material already provided, then decide what to ask; do not dump a full questionnaire on the user at the start.
- **Check the wardrobe first**: if the data directory already has a wardrobe, use it as the source of facts; write new facts back with "记衣柜：…" before changing the resume.
- If there is an old resume, make incremental edits; if not, start from spoken experience, organize the facts first, then write the resume.
- Collect the target role/JD, real education and work experience, project responsibilities and results, necessary contact details, and usable photos. Reuse information already confirmed in the conversation; ask only about missing or conflicting information that affects the application.
- If a link cannot be opened, ask the user for the job text or a screenshot and continue organizing the known experience. Use the file, browser, or document tools actually available in the environment; do not depend on any particular author's account, private repo, or connector.
- PDFs can be processed with [extract_pdf.py](scripts/extract_pdf.py) to extract text and page images; for scanned files you must actually look at the images and must not treat empty text as no experience. Dependencies and invocation are in the [script guide](scripts/README.md).
- "I've done all of this, just fill it in" confirms only the items explicitly listed in the question; it does not additionally confirm scale, results, methods, or job title. "Make it fuller/top-tier" does not permit inventing experience.

## Positioning and writing

Read the [role-tailoring strategy](version-strategy.md) and [writing guide](style-guide.md) first. Tell the user which capabilities this version emphasizes, then proceed directly:

1. Map the real job responsibilities into "requirement → confirmed experience → applicant's action → known result". Requirements without evidence are for asking questions, not for turning directly into the applicant's abilities.
2. **Internships are the main body of the page**: 2–4 bullets per experience (3 recommended), in reverse chronological order, without reordering by relevance to the role. Practice experience is ordered by relevance to the target role, with equal relevance ordered by recency; 2–3 bullets for the main project and 1–2 for the others; campus experience gets 1–2 bullets each. Adjust by evidence; do not pad the count.
3. Start each bullet with `<b>skill tag:</b>` and write the body in the **five elements**: verb first → context/problem → approach (including trade-offs) → quantified result (with baseline and definition). If an internship section is too thin, first restore confirmed responsibilities, judgments, and follow-up; do not pile on adjectives or repeat functions.
4. Preserve the source and precision of numbers. "About" must not become "more than"; participation must not be upgraded to leadership. Without result numbers, write deliverables or confirmed follow-up actions.
5. Entrepreneurship, freelancing, or independent practice can explain real gaps, but do not invent start or end months. Do not copy schools, companies, projects, awards, or achievements from the examples.

When a key role requirement lacks support, use the intake guide to judge whether it is "not written clearly" or "really not done". Ask 1–3 questions per round that can significantly improve role fit; spoken and imprecise recall is allowed; complete the parts that do not depend on the answers first. After the answer, extract new facts and update the matching project; do not re-ask confirmed content. If the user has no relevant experience, look for real transferable evidence and do not write the requirement as something the user has done.

## Photos and the built-in business headshot workflow

If there is a suitable photo of the user, include it by default; if the user explicitly does not want a photo, or the role requires anonymity/no photo, follow that preference. An old resume without a photo does not mean you should keep omitting one.

- **Already has a suitable business headshot:** actually look at and reuse the photo the user chose; do not redo it just to use a generation tool.
- **Only a clear casual photo:** explain that it will be turned into a resume business headshot and continue with the built-in workflow; generation already authorized does not need re-confirmation.
- **No reliable reference of the user:** ask for a clear, unobstructed front-facing photo while continuing to write the text. Do not invent a face from a name or experience.
- **The current agent has no image-generation capability:** explain the limitation, provide the built-in prompt for a tool that supports image editing, and continue with text layout. If no photo is available, use the no-photo version per the user's choice; do not pretend a photo was generated.

Before generating, read the built-in [business headshot workflow](references/american-business-headshot/workflow.md) and [prompt and checks](references/american-business-headshot/references/portrait-contract.md). Default: white background, dark navy suit, white shirt, deep purple tie, 3:4 framing; clothing can be adjusted to the user's preference while preserving identity, age, face shape, and real skin texture. No extra skill installation is required, but working image-editing capability is.

Keep originals and finals in the user's resume project under `assets/`, not in this skill or a public repository. Look at the actual generated result before embedding it. For the photo header, see [header-with-photo.html](templates/header-with-photo.html); replace only the header and keep the base styles. This workflow produces a business portrait and does not claim to meet government ID photo standards.

## Fixed layout and file organization

Read the [layout spec](layout-spec.md) first. Copy the template into the user's resume project, then fill in the body; do not rewrite this skill's bundled template or examples with the user's real data. Keep the template's `<style>` unchanged; only the photo header may use the provided partial styles.

The template includes an in-browser editing layer: the delivered `简历.html` can be double-clicked to edit text, see the remaining page space, export a PDF, and write changes back to the source file. Replace only the content blocks inside `<div class="doc" id="doc">`; keep the toolbar, the `.stage`/`.doc` wrappers, and the trailing `<script>` exactly as they are. The privacy mask covers only phone numbers and email addresses; do not wrap links inside body bullets. See [Editing in the browser](references/html-editor-layer.md) for the method and boundaries.

- One A4 page, 12.5mm left/right margins, body text about 9.15pt; black-background white-text section headings, square bullets, black/white/gray palette. The user's photo may keep its original colors.
- **Keep the header compact**: the header band with name, contact details, and photo is an entrance, not content — **the photo defaults to about 21 × 28mm (3:4)**, and the header's bottom padding and divider spacing stay tight; **give the remaining page space to the body**, and do not "fill" the page by enlarging the photo or adding header whitespace.
- Default order (fixed): **education → internships → practice experience → campus experience → other information**. **Use these section names; do not invent your own** (no "core strengths", "core projects", "research experience", or "skills and honors"). **Do not add a core-strengths section** — fit is proven by the experience text, and space goes to internships. Other information is always three lines: skills & certificates / personal strengths / interests. Remove sections that do not apply; if there are no awards, do not require a "competition verification" line.
- **Do not put a "target role" line in the header**: the role name is used only for the document title (the PDF bookmark name); the resume body does not state a job objective. Keep skill tags on one line; project title, role, and dates must not collide.
- **Keep data and the skill separate**: personal data (wardrobe, assets, application files) goes only in the user's data directory and never into this skill directory. The data directory **defaults to `~/我的简历/`** (Windows: `C:\Users\<you>\我的简历`); create it on the first conversation and **tell the user the full path**; if the user specifies another location, use it. If there is no target role yet, name the role folder `通用简历/` ("general resume").

```text
我的简历/                     ← user-specified data directory
├── 简历衣柜/                简历衣柜.md (single editable source), 简历衣柜.docx
├── 素材/                    photos, original resumes, certificates, and source files for works
└── 简历投递/
    ├── 投递台账.xlsx         one sheet tracking all applications (optional)
    └── 公司名称_岗位名称/
        ├── 00_进度与说明.md   current step + items awaiting user confirmation
        ├── 01_JD拆解.md
        ├── 02_经历打分.md / .xlsx
        ├── 03_投递前质检.md
        ├── 投递文件/          latest PDF, preview
        └── 制作源文件/        简历.html, assets/, necessary source material
```

Do not move or overwrite the user's originals. Keep the current deliverable, editable source file, and necessary inputs; only within the scope the user has authorized, move confirmed-discarded drafts to the trash in a recoverable way. Preparing an email is not applying; making a resume is not authorization to send email or upload it publicly.

## Export and acceptance

Install dependencies per the [script guide](scripts/README.md), then export the filled project HTML:

```bash
node scripts/render_pdf.mjs --html="/path/to/简历.html" --out="/path/to/投递文件" --name="Candidate Name" --role="Target Role" --suffix="Target Company"
```

The script checks placeholders, image loading, skill-tag line wrapping, A4 overflow, and the actual PDF page count, and outputs the PDF, a full-page preview, and a short check result. Fonts must support Chinese; if characters are missing, install a font from the template's font stack and re-export; do not deliver a PDF with garbled text.

When you need to squeeze the resume back onto one page precisely, run the ruler first and locate which line to delete by millimeters; do not guess:

```bash
node scripts/measure_layout.mjs --html="/path/to/简历.html"
```

Run the editor smoke test once more before delivery to confirm the toolbar, privacy mask, photo protection, and remaining page space work; any failure exits non-zero:

```bash
node scripts/smoke_editor.mjs --html="/path/to/简历.html"
```

After the user edits the HTML in the browser, they will notify you with "同步投递件" (sync application files): rerun `render_pdf.mjs`, confirm it is still one page, and update the status in `00_进度与说明.md`.

You must actually inspect the preview and verify the final PDF with an available PDF tool:

1. Exactly one A4 page, searchable text, no missing Chinese characters, no placeholders, overlapping text, or truncation.
2. If the last line is more than about 25mm from the bottom, re-check for omitted relevant experience; with enough evidence, white space is allowed. Do not fill the page by enlarging fonts, line spacing, margins, or the photo.
3. On overflow, first compress repetition and the longest sentences, then delete the last bullet of the weakest project or merge auxiliary experience; do not shrink the global font size.
4. With a photo, confirm it is the version the user chose, actually embedded in the PDF, with natural cropping at the top of the head, face, and shoulders; no distortion and no blocking of name or contact details.
5. Results, responsibility level, dates, and contact details match the source of truth; do not mix unconfirmed content into the final deliverable.
6. The editable source file's editing layer works: the toolbar appears, the remaining-space readout shows a value, the photo cannot be deleted, and the print preview has no toolbar.

Deliver the PDF, preview, editable source file location, and a short change note, and explain that the source file can be double-clicked to keep editing in the browser; writing back to the source file changes only this HTML, and the application PDF must be re-exported to update. Mark any unfinished fact-checking or photo steps clearly, and do not promise interview or offer outcomes.

## Sharing boundaries

This repository maintains only the general skill, templates, scripts, and clearly labeled fictional demos. Personal resumes, photos, contact details, application records, **the experience wardrobe (all experience, numbers, and their definitions)**, and login credentials stay in the user's data directory and must never be written into this skill directory. Do not change this rule into "sync the current resume to a public repository".