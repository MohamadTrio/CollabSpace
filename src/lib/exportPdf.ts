// src/lib/ExportPdf.ts

type Html2PdfChain = {
  set: (opt: Record<string, unknown>) => {
    from: (el: HTMLElement) => {
      save: () => Promise<void>;
    };
  };
};

type Html2PdfLoader = ((opt?: unknown) => Html2PdfChain) & {
  default?: (opt?: unknown) => Html2PdfChain;
};

// ─── Konversi <ol> dan <ul> ke tabel supaya angka/bullet selalu sejajar ───────
function convertListsForPdf(html: string): string {
  // Konversi <ol> → tabel dengan angka di kolom kiri
  html = html.replace(/<ol>([\s\S]*?)<\/ol>/g, (_, items) => {
    let counter = 0;
    const rows = items.replace(
      /<li[^>]*>([\s\S]*?)<\/li>/g,
      (_: string, content: string) => {
        counter++;
        // Strip tag <p> di dalam <li> karena sudah inline di tabel
        const text = content
          .replace(/<p>/g, "")
          .replace(/<\/p>/g, " ")
          .trim();
        return `
          <tr>
            <td style="
              width:28px;
              vertical-align:top;
              padding-right:6px;
              padding-bottom:6px;
              white-space:nowrap;
              color:#374151;
              font-size:14px;
            ">${counter}.</td>
            <td style="
              vertical-align:top;
              padding-bottom:6px;
              color:#374151;
              font-size:14px;
              line-height:1.6;
            ">${text}</td>
          </tr>`;
      }
    );
    return `
      <table style="
        border-collapse:collapse;
        margin:0 0 14px 0;
        width:100%;
      ">${rows}</table>`;
  });

  // Konversi <ul> → tabel dengan bullet di kolom kiri
  html = html.replace(/<ul>([\s\S]*?)<\/ul>/g, (_, items) => {
    const rows = items.replace(
      /<li[^>]*>([\s\S]*?)<\/li>/g,
      (_: string, content: string) => {
        const text = content
          .replace(/<p>/g, "")
          .replace(/<\/p>/g, " ")
          .trim();
        return `
          <tr>
            <td style="
              width:20px;
              vertical-align:top;
              padding-right:6px;
              padding-bottom:6px;
              color:#374151;
              font-size:18px;
              line-height:1.3;
            ">•</td>
            <td style="
              vertical-align:top;
              padding-bottom:6px;
              color:#374151;
              font-size:14px;
              line-height:1.6;
            ">${text}</td>
          </tr>`;
      }
    );
    return `
      <table style="
        border-collapse:collapse;
        margin:0 0 14px 0;
        width:100%;
      ">${rows}</table>`;
  });

  return html;
}

export async function exportResultToPDF(
  htmlContent: string,
  title: string,
): Promise<void> {
  const mod = (await import("html2pdf.js")) as unknown as Html2PdfLoader;
  const html2pdf =
    typeof mod.default === "function"
      ? mod.default
      : (mod as unknown as (opt?: unknown) => Html2PdfChain);

  const container = document.createElement("div");

  // ─── CSS ──────────────────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; }

    .pdf-content {
      font-family: Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      font-size: 14px;
    }

    /* Headings */
    .pdf-content h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3; }
    .pdf-content h2 { font-size: 20px; font-weight: 700; margin: 24px 0 12px 0; line-height: 1.3; }
    .pdf-content h3 { font-size: 18px; font-weight: 600; margin: 20px 0 10px 0; line-height: 1.4; }

    /* Paragraf */
    .pdf-content p { margin: 0 0 12px 0; line-height: 1.6; }

    /* List sudah dikonversi ke tabel, tidak perlu CSS list */

    /* Inline formatting */
    .pdf-content strong, .pdf-content b { font-weight: 700; }
    .pdf-content em, .pdf-content i     { font-style: italic; }
    .pdf-content s, .pdf-content strike { text-decoration: line-through; }

    /* Blockquote */
    .pdf-content blockquote {
      margin: 16px 0;
      padding: 4px 0 4px 16px;
      border-left: 4px solid #e5e7eb;
      color: #4b5563;
      font-style: italic;
    }
    .pdf-content blockquote p { margin: 0; }

    /* Code */
    .pdf-content code {
      font-family: Consolas, 'Courier New', monospace;
      background-color: #f3f4f6;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 13px;
    }
    .pdf-content pre {
      background-color: #f3f4f6;
      padding: 12px;
      border-radius: 6px;
      margin: 16px 0;
    }
    .pdf-content pre code { background: transparent; padding: 0; }

    /* Page break */
    .pdf-content h1,
    .pdf-content h2,
    .pdf-content h3    { page-break-after: avoid;  break-after: avoid; }
    .pdf-content pre,
    .pdf-content table,
    .pdf-content blockquote { page-break-inside: avoid; break-inside: avoid; }
  `;
  container.appendChild(style);

  // ─── Content wrapper ──────────────────────────────────────────────────────────
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "pdf-content";

  // Judul dokumen
  const titleEl = document.createElement("h1");
  titleEl.textContent = title || "Dokumen Tanpa Judul";
  titleEl.style.textAlign    = "center";
  titleEl.style.marginBottom = "24px";
  titleEl.style.paddingBottom = "12px";
  titleEl.style.borderBottom  = "1px solid #e5e7eb";
  contentWrapper.appendChild(titleEl);

  // Konten editor — konversi list ke tabel dulu
  const editorContent = document.createElement("div");
  editorContent.innerHTML = convertListsForPdf(
    htmlContent || "<p>Tidak ada konten</p>"
  );
  contentWrapper.appendChild(editorContent);

  container.appendChild(contentWrapper);

  // ─── Opsi html2pdf ────────────────────────────────────────────────────────────
  const filename = `${(title || "Dokumen")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;

  const opt: Record<string, unknown> = {
    margin    : [15, 15, 20, 15],
    filename,
    image     : { type: "jpeg", quality: 1 },
    html2canvas: {
      scale          : 2,
      useCORS        : true,
      letterRendering: true,
    },
    jsPDF     : { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak : {
      mode : ["css", "legacy"],
      avoid: [
        ".pdf-content p",
        ".pdf-content h1",
        ".pdf-content h2",
        ".pdf-content h3",
        "table",
        "pre",
        "blockquote",
      ],
    },
  };

  await html2pdf().set(opt).from(container).save();
}