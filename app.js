(function () {
  "use strict";

  // ---------- Helpers ----------

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function cloneTpl(id) {
    const tpl = document.getElementById(id);
    return tpl.content.firstElementChild.cloneNode(true);
  }

  function showToast(msg) {
    let toast = $(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = () => {
          const format = /image\/png/i.test(dataUrl) ? "PNG" : "JPEG";
          resolve({ dataUrl, w: img.naturalWidth || 1, h: img.naturalHeight || 1, format });
        };
        img.onerror = () => reject(new Error("No se pudo leer la imagen"));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsDataURL(file);
    });
  }

  function addThumb(galleryEl, imageRecord) {
    const thumb = cloneTpl("tpl-image-thumb");
    thumb._image = imageRecord;
    $("img", thumb).src = imageRecord.dataUrl;
    $(".btn-remove-thumb", thumb).addEventListener("click", () => thumb.remove());
    galleryEl.appendChild(thumb);
  }

  async function handleFileInput(fileInput, galleryEl) {
    const files = Array.from(fileInput.files || []);
    fileInput.value = "";
    for (const file of files) {
      try {
        const record = await readImageFile(file);
        addThumb(galleryEl, record);
      } catch (err) {
        console.error(err);
        showToast("No se pudo cargar una imagen");
      }
    }
  }

  function formatDateDMY(isoDate) {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  }

  function slugify(str) {
    return (str || "")
      .toString()
      .normalize("NFD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  // ---------- Spec table rows ----------

  const specTableBody = $("#spec-table-body");

  function addSpecRow(data) {
    const row = cloneTpl("tpl-spec-row");
    if (data) {
      $(".spec-tela", row).value = data.tela || "";
      $(".spec-tallas", row).value = data.tallas || "";
      $(".spec-cuello", row).value = data.cuello || "";
    }
    $(".btn-remove-row", row).addEventListener("click", () => row.remove());
    specTableBody.appendChild(row);
  }

  $("#btn-add-spec-row").addEventListener("click", () => addSpecRow());

  // ---------- Items ----------

  const itemsContainer = $("#items-container");

  const RESPONSABLES = [
    "Luisana",
    "Arianna",
    "Emilce",
    "Vladimir",
    "Duanscel",
    "Isaias",
    "Luisa",
    "Nelly",
    "Kiara",
    "Sofia",
  ];

  function populateResponsableSelect(select) {
    select.innerHTML =
      '<option value="">Selecciona un responsable</option>' +
      RESPONSABLES.map((name) => `<option value="${name}">${name}</option>`).join("");
  }

  function addTaskRow(taskListEl, text) {
    const row = cloneTpl("tpl-task");
    $(".task-text", row).value = text || "";
    $(".btn-remove-task", row).addEventListener("click", () => row.remove());
    taskListEl.appendChild(row);
  }

  function addItem(data) {
    const item = cloneTpl("tpl-item");
    const titleInput = $(".item-title", item);
    const responsibleSelect = $(".item-responsible", item);
    const taskList = $(".task-list", item);
    const addTaskBtn = $(".btn-add-task", item);
    const removeItemBtn = $(".btn-remove-item", item);
    const imageInput = $(".item-image-input", item);
    const gallery = $(".item-gallery", item);

    titleInput.value = (data && data.title) || "";
    populateResponsableSelect(responsibleSelect);
    responsibleSelect.value = (data && data.responsible) || "";

    addTaskBtn.addEventListener("click", () => addTaskRow(taskList));
    removeItemBtn.addEventListener("click", () => {
      if (confirm("¿Eliminar este item y todo su contenido?")) item.remove();
    });
    imageInput.addEventListener("change", () => handleFileInput(imageInput, gallery));

    if (data && Array.isArray(data.tasks) && data.tasks.length) {
      data.tasks.forEach((t) => addTaskRow(taskList, t));
    } else {
      addTaskRow(taskList);
    }

    if (data && Array.isArray(data.images)) {
      data.images.forEach((img) => addThumb(gallery, img));
    }

    itemsContainer.appendChild(item);
  }

  $("#btn-add-item").addEventListener("click", () => addItem());

  // ---------- Annexes ----------

  const annexGallery = $("#annex-gallery");
  const annexInput = $("#annex-input");
  annexInput.addEventListener("change", () => handleFileInput(annexInput, annexGallery));

  // ---------- Cliente field: manual input <-> list of common clients ----------

  const CLIENTES_HABITUALES = ["Luisana Andrade", "Bunny", "Genesis", "Made", "Guillermo"];
  const clienteInput = $("#cliente");
  const clienteSelect = $("#cliente-select");
  const clienteToggle = $("#cliente-toggle");
  const clienteModeLabel = $("#cliente-mode-label");

  clienteSelect.innerHTML =
    '<option value="">Selecciona un cliente</option>' +
    CLIENTES_HABITUALES.map((name) => `<option value="${name}">${name}</option>`).join("");

  function setClienteMode(isList) {
    clienteToggle.setAttribute("aria-checked", isList ? "true" : "false");
    clienteModeLabel.textContent = isList ? "Lista" : "Manual";
    if (isList) {
      const current = clienteInput.value.trim();
      clienteSelect.value = CLIENTES_HABITUALES.includes(current) ? current : "";
      clienteInput.hidden = true;
      clienteSelect.hidden = false;
    } else {
      if (clienteSelect.value) clienteInput.value = clienteSelect.value;
      clienteSelect.hidden = true;
      clienteInput.hidden = false;
    }
  }

  clienteToggle.addEventListener("click", () => {
    setClienteMode(clienteToggle.getAttribute("aria-checked") !== "true");
  });

  function getClienteValue() {
    return (clienteSelect.hidden ? clienteInput.value : clienteSelect.value).trim();
  }

  function setClienteValue(value) {
    const v = value || "";
    clienteInput.value = v;
    clienteSelect.value = CLIENTES_HABITUALES.includes(v) ? v : "";
    setClienteMode(false);
  }

  // ---------- Collect / restore data ----------

  function collectData() {
    const specs = $$(".spec-row", specTableBody).map((row) => ({
      tela: $(".spec-tela", row).value.trim(),
      tallas: $(".spec-tallas", row).value.trim(),
      cuello: $(".spec-cuello", row).value.trim(),
    }));

    const items = $$(".item-card", itemsContainer).map((itemEl) => ({
      title: $(".item-title", itemEl).value.trim(),
      responsible: $(".item-responsible", itemEl).value.trim(),
      tasks: $$(".task-text", itemEl)
        .map((i) => i.value.trim())
        .filter(Boolean),
      images: $$(".thumb", $(".item-gallery", itemEl)).map((t) => t._image),
    }));

    const annexes = $$(".thumb", annexGallery).map((t) => t._image);

    return {
      general: {
        fechaPedido: $("#fecha-pedido").value,
        cliente: getClienteValue(),
        fechaEntrega: $("#fecha-entrega").value,
        numeroOrden: $("#numero-orden").value.trim(),
      },
      specs,
      items,
      annexes,
    };
  }

  function restoreData(data) {
    if (!data) return;
    $("#fecha-pedido").value = (data.general && data.general.fechaPedido) || "";
    setClienteValue(data.general && data.general.cliente);
    $("#fecha-entrega").value = (data.general && data.general.fechaEntrega) || "";
    $("#numero-orden").value = (data.general && data.general.numeroOrden) || "";

    specTableBody.innerHTML = "";
    if (Array.isArray(data.specs) && data.specs.length) {
      data.specs.forEach((s) => addSpecRow(s));
    } else {
      addSpecRow();
    }

    itemsContainer.innerHTML = "";
    if (Array.isArray(data.items) && data.items.length) {
      data.items.forEach((it) => addItem(it));
    }

    annexGallery.innerHTML = "";
    if (Array.isArray(data.annexes)) {
      data.annexes.forEach((img) => addThumb(annexGallery, img));
    }
  }

  // ---------- "Nuevo pedido" ----------

  $("#btn-clear").addEventListener("click", () => {
    if (!confirm("¿Iniciar un pedido nuevo? Se perderá lo que no hayas guardado.")) return;
    specTableBody.innerHTML = "";
    itemsContainer.innerHTML = "";
    annexGallery.innerHTML = "";
    $("#fecha-pedido").value = "";
    setClienteValue("");
    $("#fecha-entrega").value = "";
    $("#numero-orden").value = "";
    addSpecRow();
    showToast("Formulario reiniciado");
  });

  function loadInitialState() {
    addSpecRow();
  }

  // ---------- IndexedDB (remembers the "orders" folder handle) ----------

  const IDB_NAME = "orifer-db";
  const IDB_STORE = "kv";

  function openIdb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbSet(key, value) {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ---------- Named folder access (File System Access API) ----------

  const FS_ACCESS_SUPPORTED = "showDirectoryPicker" in window;

  async function ensureDirPermission(handle) {
    const opts = { mode: "readwrite" };
    if ((await handle.queryPermission(opts)) === "granted") return true;
    if ((await handle.requestPermission(opts)) === "granted") return true;
    return false;
  }

  async function getNamedDir(idbKey, folderName, promptMessage) {
    if (!FS_ACCESS_SUPPORTED) throw new Error("unsupported");

    let handle = await idbGet(idbKey).catch(() => null);
    if (handle) {
      try {
        if (await ensureDirPermission(handle)) return handle;
      } catch (err) {
        /* stale handle, fall through to re-prompt */
      }
    }

    alert(promptMessage);
    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ id: `orifer-${folderName}`, mode: "readwrite" });
    } catch (err) {
      throw new Error("cancelled");
    }

    if (!(await ensureDirPermission(dirHandle))) throw new Error("permission-denied");

    await idbSet(idbKey, dirHandle);
    return dirHandle;
  }

  function getOrdersDir() {
    return getNamedDir("ordersDir", "orders", 'Selecciona la carpeta "orders" que ya creaste.');
  }

  function getPdfDir() {
    return getNamedDir("pdfDir", "pdf", 'Selecciona la carpeta "pdf" que ya creaste.');
  }

  // Existing installs may have a cached handle pointing at a nested
  // subfolder created by an earlier version (e.g. orders/orders). Reset
  // the cache once so the next save re-prompts and uses the picked
  // folder directly.
  const DIR_SCHEMA_VERSION = 2;
  async function migrateDirHandles() {
    const version = await idbGet("dirSchemaVersion").catch(() => null);
    if (version === DIR_SCHEMA_VERSION) return;
    await idbSet("ordersDir", null).catch(() => {});
    await idbSet("pdfDir", null).catch(() => {});
    await idbSet("dirSchemaVersion", DIR_SCHEMA_VERSION).catch(() => {});
  }

  // ---------- Filename convention: <numero_pedido>_<dd>_<mm>_<yy>.json ----------

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function buildOrderFilename(data) {
    const numero = slugify(data.general.numeroOrden) || "pedido";
    let d;
    if (data.general.fechaPedido) {
      const [y, m, day] = data.general.fechaPedido.split("-").map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date();
    }
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yy = pad2(d.getFullYear() % 100);
    return `${numero}_${dd}_${mm}_${yy}.json`;
  }

  function triggerBrowserDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadJsonFallback(json, filename) {
    triggerBrowserDownload(new Blob([json], { type: "application/json" }), filename);
    showToast(`Pedido descargado como ${filename} — muévelo a tu carpeta "orders"`);
  }

  function downloadPdfFallback(blob, filename) {
    triggerBrowserDownload(blob, filename);
    showToast(`PDF descargado como ${filename} — muévelo a tu carpeta "pdf"`);
  }

  async function savePdfToFile(doc, filename) {
    const blob = doc.output("blob");

    if (FS_ACCESS_SUPPORTED) {
      try {
        const dirHandle = await getPdfDir();
        const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        showToast(`PDF guardado en pdf/${filename}`);
        return;
      } catch (err) {
        if (err && err.message === "cancelled") {
          showToast("Guardado del PDF cancelado");
          return;
        }
        console.error(err);
      }
    }
    downloadPdfFallback(blob, filename);
  }

  async function savePedidoToFile() {
    const data = collectData();
    const filename = buildOrderFilename(data);
    const json = JSON.stringify(data, null, 2);

    if (FS_ACCESS_SUPPORTED) {
      try {
        const dirHandle = await getOrdersDir();
        const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(json);
        await writable.close();
        showToast(`Pedido guardado en orders/${filename}`);
        return;
      } catch (err) {
        if (err && err.message === "cancelled") {
          showToast("Guardado cancelado");
          return;
        }
        console.error(err);
      }
    }
    downloadJsonFallback(json, filename);
  }

  $("#btn-save").addEventListener("click", () => {
    savePedidoToFile().catch((err) => {
      console.error(err);
      showToast("Ocurrió un error guardando el pedido");
    });
  });

  // ---------- "Editar pedido" (load an existing JSON) ----------

  const pickerModal = $("#pedido-picker-modal");
  const pickerList = $("#pedido-picker-list");
  const editPedidoInput = $("#edit-pedido-input");

  function openPickerModal() {
    pickerModal.hidden = false;
  }
  function closePickerModal() {
    pickerModal.hidden = true;
    pickerList.innerHTML = "";
  }
  $("#btn-close-modal").addEventListener("click", closePickerModal);
  pickerModal.addEventListener("click", (e) => {
    if (e.target === pickerModal) closePickerModal();
  });
  $("#btn-pick-manual").addEventListener("click", () => {
    closePickerModal();
    editPedidoInput.click();
  });

  function parseFilenameLabel(filename) {
    const match = /^(.+?)_(\d{2})_(\d{2})_(\d{2})\.json$/i.exec(filename);
    if (!match) return filename;
    const [, numero, dd, mm, yy] = match;
    return `Pedido ${numero} — ${dd}/${mm}/20${yy}`;
  }

  async function loadPedidoFromHandle(dirHandle, filename) {
    const fileHandle = await dirHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    const text = await file.text();
    restoreData(JSON.parse(text));
    closePickerModal();
    showToast(`Pedido cargado: ${filename}`);
  }

  async function showPedidoPickerModal(dirHandle) {
    const files = [];
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "file" && name.toLowerCase().endsWith(".json")) files.push(name);
    }
    files.sort().reverse();

    pickerList.innerHTML = "";
    if (!files.length) {
      const li = document.createElement("li");
      li.className = "picker-empty";
      li.textContent = "No hay pedidos guardados en la carpeta \"orders\".";
      pickerList.appendChild(li);
    } else {
      files.forEach((filename) => {
        const li = document.createElement("li");
        li.textContent = parseFilenameLabel(filename);
        li.addEventListener("click", () => {
          loadPedidoFromHandle(dirHandle, filename).catch((err) => {
            console.error(err);
            showToast("No se pudo abrir ese pedido");
          });
        });
        pickerList.appendChild(li);
      });
    }
    openPickerModal();
  }

  async function openEditPedido() {
    if (FS_ACCESS_SUPPORTED) {
      try {
        const dirHandle = await getOrdersDir();
        await showPedidoPickerModal(dirHandle);
        return;
      } catch (err) {
        if (err && err.message === "cancelled") {
          showToast("Operación cancelada");
          return;
        }
        console.error(err);
      }
    }
    editPedidoInput.click();
  }

  $("#btn-edit-pedido").addEventListener("click", () => {
    openEditPedido().catch((err) => {
      console.error(err);
      showToast("Ocurrió un error abriendo el selector de pedidos");
    });
  });

  editPedidoInput.addEventListener("change", async () => {
    const file = editPedidoInput.files[0];
    editPedidoInput.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      restoreData(JSON.parse(text));
      showToast(`Pedido cargado: ${file.name}`);
    } catch (err) {
      console.error(err);
      showToast("El archivo seleccionado no es un pedido válido");
    }
  });

  // ---------- PDF generation ----------

  const PDF_PRIMARY = [20, 107, 184]; // brand navy (logo)
  const PDF_ACCENT = [0, 167, 219]; // brand cyan (logo)
  const PDF_RADIUS = 2; // corner radius (mm) for boxes/tables in the PDF

  function ensureSpace(doc, y, needed, margins) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - margins.bottom) {
      doc.addPage();
      return margins.top;
    }
    return y;
  }

  // Draws a small table with genuinely rounded outer corners. jspdf-autotable
  // only draws square cells, and overlaying a rounded stroke on top of it
  // leaves the square corners peeking out past the curve, so cell fills here
  // are painted inside a clip region shaped like the rounded rect instead.
  function drawRoundedTable(doc, { x, y, colWidths, rows, cellStyle, margins, fontSize = 10 }) {
    const cellPadding = 3;
    const lineHeight = 4.2;
    const width = colWidths.reduce((a, b) => a + b, 0);

    doc.setFontSize(fontSize);
    const rowHeights = rows.map((cells) =>
      Math.max(
        ...cells.map((text, ci) => {
          const lines = doc.splitTextToSize(String(text ?? ""), colWidths[ci] - cellPadding * 2);
          return lines.length * lineHeight + cellPadding * 2;
        })
      )
    );
    const totalHeight = rowHeights.reduce((a, b) => a + b, 0);

    y = ensureSpace(doc, y, totalHeight, margins);
    const startY = y;

    doc.saveGraphicsState();
    doc.roundedRect(x, startY, width, totalHeight, PDF_RADIUS, PDF_RADIUS, null);
    doc.clip();
    doc.discardPath();

    let ry = startY;
    rows.forEach((cells, ri) => {
      let rx = x;
      cells.forEach((_, ci) => {
        const style = (cellStyle && cellStyle(ri, ci)) || {};
        if (style.fill) {
          doc.setFillColor(...style.fill);
          doc.rect(rx, ry, colWidths[ci], rowHeights[ri], "F");
        }
        rx += colWidths[ci];
      });
      ry += rowHeights[ri];
    });

    doc.setDrawColor(223, 226, 230);
    doc.setLineWidth(0.2);
    let hy = startY;
    for (let i = 0; i < rowHeights.length - 1; i++) {
      hy += rowHeights[i];
      doc.line(x, hy, x + width, hy);
    }
    let vx = x;
    for (let i = 0; i < colWidths.length - 1; i++) {
      vx += colWidths[i];
      doc.line(vx, startY, vx, startY + totalHeight);
    }

    doc.restoreGraphicsState();

    doc.setDrawColor(223, 226, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, startY, width, totalHeight, PDF_RADIUS, PDF_RADIUS, "S");

    ry = startY;
    rows.forEach((cells, ri) => {
      let rx = x;
      cells.forEach((text, ci) => {
        const style = (cellStyle && cellStyle(ri, ci)) || {};
        doc.setFont("helvetica", style.bold ? "bold" : "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(...(style.textColor || [31, 36, 48]));
        const lines = doc.splitTextToSize(String(text ?? ""), colWidths[ci] - cellPadding * 2);
        doc.text(lines, rx + cellPadding, ry + cellPadding + lineHeight * 0.72);
        rx += colWidths[ci];
      });
      ry += rowHeights[ri];
    });
    doc.setTextColor(0, 0, 0);

    return startY + totalHeight;
  }

  // Renders the task list as a bordered box with a divider line between
  // rows, so tasks read as a table instead of a loose stack of lines.
  function drawTasksTable(doc, tasks, x, y, width, margins) {
    if (!tasks.length) return y;
    const padX = 4;
    const padTop = 4;
    const padBottom = 4;
    const rowPadding = 4;
    const checkboxSize = 3.2;
    const textX = x + padX + checkboxSize + 3;
    const textWidth = x + width - 3 - textX;
    const lineHeight = 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const rowHeights = tasks.map((task) => {
      const lines = doc.splitTextToSize(task, textWidth);
      return lines.length * lineHeight + rowPadding;
    });
    const totalHeight = padTop + rowHeights.reduce((a, b) => a + b, 0) + padBottom;

    y = ensureSpace(doc, y, totalHeight, margins);
    const startY = y;

    doc.setDrawColor(223, 226, 230);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, startY, width, totalHeight, PDF_RADIUS, PDF_RADIUS, "S");

    let ry = startY + padTop;
    tasks.forEach((task, i) => {
      const lines = doc.splitTextToSize(task, textWidth);
      const rowH = rowHeights[i];
      const blockHeight = lines.length * lineHeight;
      const blockTop = ry + (rowH - blockHeight) / 2;
      const textBaselineY = blockTop + lineHeight * 0.72;
      const checkboxY = ry + rowH / 2 - checkboxSize / 2;

      doc.setDrawColor(...PDF_ACCENT);
      doc.setLineWidth(0.5);
      doc.roundedRect(x + padX, checkboxY, checkboxSize, checkboxSize, 0.7, 0.7, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(lines, textX, textBaselineY);

      if (i < tasks.length - 1) {
        const dividerY = ry + rowH;
        doc.setDrawColor(223, 226, 230);
        doc.setLineWidth(0.2);
        doc.line(x, dividerY, x + width, dividerY);
      }
      ry += rowH;
    });

    return startY + totalHeight;
  }

  // Embedded as a base64 data URL (assets/logo.js) instead of read from the
  // <img> via canvas — canvas.toDataURL() throws a SecurityError in most
  // browsers when the page is opened directly as a file:// URL, which
  // silently dropped the logo from the PDF.
  let logoForPdfCache = null;
  function getLogoForPdf() {
    if (logoForPdfCache) return logoForPdfCache;
    logoForPdfCache = new Promise((resolve, reject) => {
      if (!window.LOGO_DATA_URL) {
        reject(new Error("Logo no disponible (assets/logo.js no se cargó)"));
        return;
      }
      const img = new Image();
      img.onload = () => resolve({ dataUrl: window.LOGO_DATA_URL, w: img.naturalWidth, h: img.naturalHeight, format: "PNG" });
      img.onerror = () => reject(new Error("No se pudo cargar el logo"));
      img.src = window.LOGO_DATA_URL;
    });
    return logoForPdfCache;
  }

  function renderImageGrid(doc, images, x0, y, colWidth, perRow, margins) {
    if (!images || !images.length) return y;
    const gap = 4;
    const cellW = (colWidth - gap * (perRow - 1)) / perRow;
    const cellH = cellW;
    let col = 0;

    images.forEach((img) => {
      if (col === 0) y = ensureSpace(doc, y, cellH + gap, margins);
      const x = x0 + col * (cellW + gap);
      doc.setDrawColor(210);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, cellW, cellH, PDF_RADIUS, PDF_RADIUS, "S");
      const scale = Math.min(cellW / img.w, cellH / img.h);
      const w = img.w * scale, h = img.h * scale;
      const ix = x + (cellW - w) / 2, iy = y + (cellH - h) / 2;
      try {
        doc.addImage(img.dataUrl, img.format, ix, iy, w, h);
      } catch (err) {
        console.error("Error embebiendo imagen en PDF", err);
      }
      col++;
      if (col === perRow) {
        col = 0;
        y += cellH + gap;
      }
    });
    if (col !== 0) y += cellH + gap;
    return y;
  }

  async function generatePDF() {
    const data = collectData();

    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast("No se pudo cargar el generador de PDF");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margins = { top: 15, bottom: 15, left: 14, right: 14 };
    const pageWidth = doc.internal.pageSize.getWidth();

    let logo = null;
    try {
      logo = await getLogoForPdf();
    } catch (err) {
      console.error("No se pudo incluir el logo en el PDF", err);
    }

    if (logo) {
      const logoH = 15;
      const logoW = (logoH * logo.w) / logo.h;
      const startX = (pageWidth - logoW) / 2;
      doc.addImage(logo.dataUrl, logo.format, startX, 6, logoW, logoH);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("PEDIDO", pageWidth / 2, 14, { align: "center" });
      doc.setFont("helvetica", "normal");
    }

    const contentWidthTop = pageWidth - margins.left - margins.right;
    const labelColW = 38;
    const valueColW = (contentWidthTop - labelColW * 2) / 2;

    let y = drawRoundedTable(doc, {
      x: margins.left,
      y: 24,
      colWidths: [labelColW, valueColW, labelColW, valueColW],
      cellStyle: (ri, ci) =>
        ci === 0 || ci === 2 ? { bold: true, fill: [240, 242, 245] } : { bold: false },
      margins,
      rows: [
        ["Número de orden", data.general.numeroOrden || "-", "Fecha del pedido", formatDateDMY(data.general.fechaPedido) || "-"],
        ["Cliente", data.general.cliente || "-", "Fecha de entrega", formatDateDMY(data.general.fechaEntrega) || "-"],
      ],
    });
    y += 10;

    const specRows = data.specs.filter((s) => s.tela || s.tallas || s.cuello);
    if (specRows.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Especificaciones", margins.left, y);
      y += 4;
      const specColW = contentWidthTop / 3;
      y = drawRoundedTable(doc, {
        x: margins.left,
        y,
        colWidths: [specColW, specColW, specColW],
        cellStyle: (ri) => (ri === 0 ? { bold: true, fill: PDF_PRIMARY, textColor: [255, 255, 255] } : {}),
        margins,
        rows: [
          ["Tipo de tela", "Tallas", "Tipo de cuello"],
          ...specRows.map((s) => [s.tela || "-", s.tallas || "-", s.cuello || "-"]),
        ],
      });
      y += 10;
    }

    data.items.forEach((item, idx) => {
      y = ensureSpace(doc, y, 14, margins);

      doc.setFillColor(...PDF_PRIMARY);
      doc.roundedRect(margins.left, y, pageWidth - margins.left - margins.right, 8, PDF_RADIUS, PDF_RADIUS, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${item.title || "(sin título)"}: ${item.responsible || "-"}`, margins.left + 2, y + 5.5);
      doc.setTextColor(0, 0, 0);
      y += 15;

      const contentWidth = pageWidth - margins.left - margins.right;
      const colGap = 6;
      const splitLayout = item.tasks.length > 0 && item.images.length > 0;
      const leftColW = splitLayout ? Math.round(contentWidth * 0.6) : contentWidth;
      const rightColX = splitLayout ? margins.left + leftColW + colGap : margins.left;
      const rightColW = splitLayout ? contentWidth - leftColW - colGap : contentWidth;
      const imagesPerRow = splitLayout ? 2 : 3;

      const blockStartY = y;
      let leftY = y;

      if (item.tasks.length) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Tareas:", margins.left, leftY);
        leftY += 5;
        leftY = drawTasksTable(doc, item.tasks, margins.left, leftY, leftColW, margins);
      }

      let rightY = blockStartY;
      if (item.images.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Imágenes:", rightColX, rightY);
        rightY += 6;
        doc.setFont("helvetica", "normal");
        rightY = renderImageGrid(doc, item.images, rightColX, rightY, rightColW, imagesPerRow, margins);
      }

      y = Math.max(leftY, rightY) + 3;
    });

    if (data.annexes.length) {
      y = ensureSpace(doc, y, 14, margins);
      doc.setFillColor(...PDF_PRIMARY);
      doc.roundedRect(margins.left, y, pageWidth - margins.left - margins.right, 8, PDF_RADIUS, PDF_RADIUS, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Anexos", margins.left + 2, y + 5.5);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      y += 12;
      y = renderImageGrid(doc, data.annexes, margins.left, y, pageWidth - margins.left - margins.right, 3, margins);
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margins.right, doc.internal.pageSize.getHeight() - 8, {
        align: "right",
      });
      doc.text(
        `Orden: ${data.general.numeroOrden || "-"}  |  Cliente: ${data.general.cliente || "-"}`,
        margins.left,
        doc.internal.pageSize.getHeight() - 8
      );
    }

    const filename = buildOrderFilename(data).replace(/\.json$/i, ".pdf");
    await savePdfToFile(doc, filename);
  }

  $("#btn-pdf").addEventListener("click", () => {
    generatePDF().catch((err) => {
      console.error(err);
      showToast("Ocurrió un error generando el PDF");
    });
  });

  // ---------- Init ----------

  migrateDirHandles().catch((err) => console.error(err));
  loadInitialState();
})();
