
const modules = [
  {
    id: "meal-plan-record",
    title: "LAYA MEAL PLAN RECORD",
    subtitle: "บันทึกข้อมูล Meal Plan / Breakfast / Lunch / Dinner",
    description: "เก็บข้อมูลลูกค้าที่มาใช้บริการอาหาร, แพ็กเกจ, cover, revenue และหมายเหตุในระบบเดียว",
    color: "orange",
    icon: "🍽️",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "mealType", label: "Meal Type", type: "select", options: ["Breakfast", "Lunch", "Dinner", "All Inclusive", "Half Board", "Full Board"], required: true },
      { name: "guestName", label: "Guest Name", type: "text", placeholder: "เช่น Mr. John Doe", required: true },
      { name: "roomNo", label: "Room No.", type: "text", placeholder: "A105" },
      { name: "pax", label: "Pax / Cover", type: "number", min: 1, value: 1, required: true },
      { name: "unitPrice", label: "Price per Pax", type: "number", min: 0, value: 0, required: true },
      { name: "remarks", label: "Remarks", type: "textarea", placeholder: "เช่น Walk-in / Upgrade / Complimentary" }
    ],
    columns: ["date","mealType","guestName","roomNo","pax","unitPrice","total","remarks"],
    computed(record){
      const total = Number(record.pax || 0) * Number(record.unitPrice || 0);
      return { total };
    },
    summary(records){
      const covers = records.reduce((s,r)=>s + Number(r.pax || 0),0);
      const revenue = records.reduce((s,r)=>s + Number(r.total || 0),0);
      return [
        { label:"Records", value: records.length },
        { label:"Total Cover", value: formatNumber(covers) },
        { label:"Revenue", value: formatCurrency(revenue) }
      ];
    }
  },
  {
    id: "loss-damage",
    title: "LAYA LOSS DAMAGE",
    subtitle: "บันทึกของสูญหาย / เสียหาย / เคลม",
    description: "ติดตามเหตุการณ์ของสูญหายหรืออุปกรณ์เสียหาย พร้อมต้นทุน, ผู้รับผิดชอบ และสถานะการติดตาม",
    color: "red",
    icon: "⚠️",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "location", label: "Location / Area", type: "text", placeholder: "เช่น The Taste / Store / Banquet", required: true },
      { name: "itemName", label: "Item Name", type: "text", placeholder: "เช่น Wine Glass" , required: true},
      { name: "quantity", label: "Quantity", type: "number", min: 1, value: 1, required: true },
      { name: "estimatedCost", label: "Estimated Cost", type: "number", min: 0, value: 0, required: true },
      { name: "responsibleBy", label: "Responsible / Reported By", type: "text", placeholder: "ชื่อผู้เกี่ยวข้อง" },
      { name: "status", label: "Status", type: "select", options: ["Open", "Investigating", "Claimed", "Closed"], required: true },
      { name: "details", label: "Details", type: "textarea", placeholder: "รายละเอียดเหตุการณ์" }
    ],
    columns: ["date","location","itemName","quantity","estimatedCost","responsibleBy","status","details"],
    summary(records){
      const qty = records.reduce((s,r)=>s + Number(r.quantity || 0),0);
      const cost = records.reduce((s,r)=>s + Number(r.estimatedCost || 0),0);
      const openCount = records.filter(r => r.status === "Open" || r.status === "Investigating").length;
      return [
        { label:"Records", value: records.length },
        { label:"Qty", value: formatNumber(qty) },
        { label:"Estimated Cost", value: formatCurrency(cost) },
        { label:"Open Cases", value: openCount }
      ];
    }
  },
  {
    id: "breakage-spoiled",
    title: "LAYA BREAKAGE SPOILLED",
    subtitle: "ควบคุมแก้วแตก วัตถุดิบเสีย และของชำรุด",
    description: "สรุปรายการ breakage และ spoiled เพื่อใช้ควบคุมต้นทุนและติดตามสาเหตุอย่างเป็นระบบ",
    color: "pink",
    icon: "🥂",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "category", label: "Category", type: "select", options: ["Glassware", "Chinaware", "Cutlery", "Food", "Beverage", "Other"], required: true },
      { name: "itemName", label: "Item Name", type: "text", required: true },
      { name: "quantity", label: "Quantity", type: "number", min: 1, value: 1, required: true },
      { name: "unitCost", label: "Unit Cost", type: "number", min: 0, value: 0, required: true },
      { name: "reason", label: "Reason", type: "select", options: ["Breakage", "Expired", "Spoiled", "Handling Issue", "Unknown"], required: true },
      { name: "reportedBy", label: "Reported By", type: "text" },
      { name: "remarks", label: "Remarks", type: "textarea" }
    ],
    columns: ["date","category","itemName","quantity","unitCost","total","reason","reportedBy","remarks"],
    computed(record){
      return { total: Number(record.quantity || 0) * Number(record.unitCost || 0) };
    },
    summary(records){
      const qty = records.reduce((s,r)=>s + Number(r.quantity || 0),0);
      const cost = records.reduce((s,r)=>s + Number(r.total || 0),0);
      return [
        { label:"Records", value: records.length },
        { label:"Qty", value: formatNumber(qty) },
        { label:"Total Cost", value: formatCurrency(cost) }
      ];
    }
  },
  {
    id: "daily-linen-inspection-check-list",
    title: "LAYA DAILY LINEN INSPECTION CHECK LIST",
    subtitle: "เช็กลิสต์ตรวจสภาพผ้าประจำวัน",
    description: "ใช้ตรวจสภาพผ้าแต่ละพื้นที่ก่อนเริ่มงาน เช่น สะอาด, เปื้อน, ชำรุด, ขาดจำนวน หรือพร้อมใช้งาน",
    color: "cyan",
    icon: "🧺",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "area", label: "Area", type: "select", options: ["The Taste", "Mangrove", "Banquet", "Room Service", "Laundry"], required: true },
      { name: "inspector", label: "Inspector", type: "text", required: true },
      { name: "tablecloth", label: "Tablecloth", type: "select", options: ["OK", "Dirty", "Torn", "Missing"], required: true },
      { name: "napkin", label: "Napkin", type: "select", options: ["OK", "Dirty", "Torn", "Missing"], required: true },
      { name: "runnerPlacemat", label: "Runner / Placemat", type: "select", options: ["OK", "Dirty", "Torn", "Missing"], required: true },
      { name: "uniform", label: "Uniform / Service Cloth", type: "select", options: ["OK", "Dirty", "Torn", "Missing"], required: true },
      { name: "remarks", label: "Remarks", type: "textarea", placeholder: "บันทึกปัญหาที่พบ" }
    ],
    columns: ["date","area","inspector","tablecloth","napkin","runnerPlacemat","uniform","remarks"],
    summary(records){
      const issues = records.filter(r => ["Dirty","Torn","Missing"].includes(r.tablecloth) || ["Dirty","Torn","Missing"].includes(r.napkin) || ["Dirty","Torn","Missing"].includes(r.runnerPlacemat) || ["Dirty","Torn","Missing"].includes(r.uniform)).length;
      return [
        { label:"Check Lists", value: records.length },
        { label:"Need Attention", value: issues },
        { label:"OK Rate", value: records.length ? Math.round(((records.length - issues)/records.length)*100) + "%" : "0%" }
      ];
    }
  },
  {
    id: "linen-inventory",
    title: "LAYA LINEN INVENTORY",
    subtitle: "สต็อกผ้า รับเข้า เบิกจ่าย ชำรุด คงเหลือ",
    description: "บันทึกการเคลื่อนไหวคลังผ้าแบบ inventory เพื่อเช็กยอดคงเหลือและต้นทุนการใช้งาน",
    color: "blue",
    icon: "📦",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "linenType", label: "Linen Type", type: "select", options: ["Tablecloth", "Napkin", "Placemat", "Towel", "Uniform", "Other"], required: true },
      { name: "openingStock", label: "Opening Stock", type: "number", min: 0, value: 0, required: true },
      { name: "received", label: "Received", type: "number", min: 0, value: 0, required: true },
      { name: "issued", label: "Issued", type: "number", min: 0, value: 0, required: true },
      { name: "damaged", label: "Damaged / Lost", type: "number", min: 0, value: 0, required: true },
      { name: "storeBy", label: "Stored / Updated By", type: "text" },
      { name: "remarks", label: "Remarks", type: "textarea" }
    ],
    columns: ["date","linenType","openingStock","received","issued","damaged","endingStock","storeBy","remarks"],
    computed(record){
      const endingStock = Number(record.openingStock || 0) + Number(record.received || 0) - Number(record.issued || 0) - Number(record.damaged || 0);
      return { endingStock };
    },
    summary(records){
      const ending = records.reduce((s,r)=>s + Number(r.endingStock || 0),0);
      const damage = records.reduce((s,r)=>s + Number(r.damaged || 0),0);
      return [
        { label:"Records", value: records.length },
        { label:"Ending Total", value: formatNumber(ending) },
        { label:"Damaged / Lost", value: formatNumber(damage) }
      ];
    }
  },
  {
    id: "equipment-inventory",
    title: "LAYA EQUIPMENT INVENTORY",
    subtitle: "ครุภัณฑ์ อุปกรณ์ และทรัพย์สินในงานบริการ",
    description: "บันทึกอุปกรณ์แต่ละประเภท, สถานที่เก็บ, จำนวน และสภาพการใช้งาน เพื่อใช้ตรวจนับและควบคุมทรัพย์สิน",
    color: "green",
    icon: "🛠️",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "equipmentName", label: "Equipment Name", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["Service", "Kitchen", "Bar", "Laundry", "Housekeeping", "Other"], required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "quantity", label: "Quantity", type: "number", min: 0, value: 1, required: true },
      { name: "condition", label: "Condition", type: "select", options: ["Good", "Need Repair", "Broken", "Missing"], required: true },
      { name: "assetCode", label: "Asset Code", type: "text", placeholder: "เช่น EQ-001" },
      { name: "remarks", label: "Remarks", type: "textarea" }
    ],
    columns: ["date","equipmentName","category","location","quantity","condition","assetCode","remarks"],
    summary(records){
      const qty = records.reduce((s,r)=>s + Number(r.quantity || 0),0);
      const broken = records.filter(r => r.condition === "Broken" || r.condition === "Missing").length;
      return [
        { label:"Records", value: records.length },
        { label:"Qty", value: formatNumber(qty) },
        { label:"Broken / Missing", value: broken }
      ];
    }
  },
  {
    id: "linen-record",
    title: "LAYA LINEN RECORD",
    subtitle: "ประวัติการรับส่ง เคลื่อนไหว และติดตามผ้า",
    description: "ใช้บันทึกรับเข้า ส่งซัก รับคืน ตัดจ่าย หรือเคลื่อนไหวอื่น ๆ ของผ้าแต่ละประเภท",
    color: "purple",
    icon: "🧾",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "movementType", label: "Movement Type", type: "select", options: ["Receive", "Send Laundry", "Return", "Transfer", "Discard"], required: true },
      { name: "linenType", label: "Linen Type", type: "select", options: ["Tablecloth", "Napkin", "Placemat", "Towel", "Uniform", "Other"], required: true },
      { name: "quantity", label: "Quantity", type: "number", min: 1, value: 1, required: true },
      { name: "referenceNo", label: "Reference No.", type: "text", placeholder: "เลขที่เอกสาร / batch" },
      { name: "fromTo", label: "From / To", type: "text", placeholder: "เช่น Laundry / Banquet Store" },
      { name: "recordedBy", label: "Recorded By", type: "text" },
      { name: "remarks", label: "Remarks", type: "textarea" }
    ],
    columns: ["date","movementType","linenType","quantity","referenceNo","fromTo","recordedBy","remarks"],
    summary(records){
      const qty = records.reduce((s,r)=>s + Number(r.quantity || 0),0);
      const send = records.filter(r => r.movementType === "Send Laundry").length;
      return [
        { label:"Records", value: records.length },
        { label:"Qty", value: formatNumber(qty) },
        { label:"Sent to Laundry", value: send }
      ];
    }
  }
];

const STORAGE_PREFIX = "laya-operations-hub::";
const dashboardView = document.getElementById("dashboardView");
const moduleView = document.getElementById("moduleView");
const navMenu = document.getElementById("navMenu");
const exportAllBtn = document.getElementById("exportAllBtn");

function todayValue(){
  return new Date().toISOString().slice(0,10);
}
function formatNumber(value){
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}
function formatCurrency(value){
  return new Intl.NumberFormat("en-US", { minimumFractionDigits:0, maximumFractionDigits:0 }).format(Number(value || 0));
}
function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}
function badgeClass(value){
  const text = String(value || "").toLowerCase();
  if(["good","ok","closed","claimed","return","receive"].includes(text)) return "ok";
  if(["need repair","open","investigating","send laundry","dirty"].includes(text)) return "warn";
  if(["broken","missing","torn","spoiled","breakage"].includes(text)) return "bad";
  return "info";
}
function getModule(moduleId){
  return modules.find(m => m.id === moduleId);
}
function getStorageKey(moduleId){
  return STORAGE_PREFIX + moduleId;
}
function getRecords(moduleId){
  try{
    return JSON.parse(localStorage.getItem(getStorageKey(moduleId))) || [];
  }catch{
    return [];
  }
}
function saveRecords(moduleId, records){
  localStorage.setItem(getStorageKey(moduleId), JSON.stringify(records));
}
function toCSV(rows){
  if(!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replaceAll('"','""')}"`;
  const lines = [headers.map(escape).join(",")];
  rows.forEach(row => lines.push(headers.map(h => escape(row[h])).join(",")));
  return lines.join("\n");
}
function downloadFile(filename, content, type = "text/csv;charset=utf-8;"){
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function moduleCount(){
  return modules.reduce((sum, m) => sum + getRecords(m.id).length, 0);
}

function renderNav(activeId = "dashboard"){
  navMenu.innerHTML = "";
  const dashboardBtn = document.createElement("button");
  dashboardBtn.className = "nav-button " + (activeId === "dashboard" ? "active" : "");
  dashboardBtn.innerHTML = `
    <div class="nav-icon color-orange">🏠</div>
    <div class="nav-text">
      <strong>Main Dashboard</strong>
      <span>หน้าเมนูรวมและสรุปจำนวนรายการทั้งหมด</span>
    </div>
  `;
  dashboardBtn.addEventListener("click", () => showDashboard());
  navMenu.appendChild(dashboardBtn);

  modules.forEach(module => {
    const btn = document.createElement("button");
    btn.className = "nav-button " + (activeId === module.id ? "active" : "");
    btn.innerHTML = `
      <div class="nav-icon color-${module.color}">${module.icon}</div>
      <div class="nav-text">
        <strong>${module.title}</strong>
        <span>${module.subtitle}</span>
      </div>
    `;
    btn.addEventListener("click", () => showModule(module.id));
    navMenu.appendChild(btn);
  });
}

function renderDashboard(){
  const summaries = modules.map(module => ({
    ...module,
    count: getRecords(module.id).length
  }));

  dashboardView.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Modules</div>
        <div class="value">${modules.length}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Records</div>
        <div class="value">${moduleCount()}</div>
      </div>
      <div class="summary-card">
        <div class="label">System Type</div>
        <div class="value">All-in-One</div>
      </div>
      <div class="summary-card">
        <div class="label">Deploy</div>
        <div class="value">GitHub Pages</div>
      </div>
    </div>

    <div class="dashboard-grid">
      ${summaries.map(module => `
        <article class="module-card" data-color="${module.color}">
          <div class="module-top">
            <span class="pill">MODULE</span>
            <h3>${module.title}</h3>
            <p>${module.description}</p>
          </div>
          <div class="module-bottom">
            <div class="meta">Records saved: <strong>${module.count}</strong></div>
            <button class="open-btn" data-open-module="${module.id}">Open Module</button>
          </div>
        </article>
      `).join("")}
    </div>

    <div class="panel" style="margin-top:18px">
      <h4>วิธีใช้งาน</h4>
      <div class="panel-sub">
        กดเข้าแต่ละโมดูลเพื่อกรอกข้อมูลจริง, ข้อมูลจะถูกบันทึกในเบราว์เซอร์เครื่องที่ใช้งานอยู่
        และสามารถกด Export CSV ของแต่ละโมดูลได้ตลอด
      </div>
      <div class="footer-note">
        หากต้องการเชื่อม Firebase, แยกสิทธิ์ผู้ใช้ หรือทำระบบล็อกอิน สามารถนำชุดนี้ไปต่อยอดได้ทันที
      </div>
    </div>
  `;

  dashboardView.querySelectorAll("[data-open-module]").forEach(button => {
    button.addEventListener("click", () => showModule(button.dataset.openModule));
  });
}

function buildForm(module, existing = {}){
  return `
    <form id="moduleForm" class="form-grid">
      ${module.fields.map(field => renderField(field, existing[field.name])).join("")}
      <div class="form-field full">
        <button class="action-btn primary color-${module.color}" type="submit">Save Record</button>
      </div>
    </form>
  `;
}
function renderField(field, existingValue){
  const value = existingValue ?? field.value ?? (field.type === "date" ? todayValue() : "");
  if(field.type === "textarea"){
    return `
      <div class="form-field ${field.full ? "full" : ""}">
        <label>${field.label}</label>
        <textarea name="${field.name}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""}>${escapeHtml(value)}</textarea>
      </div>
    `;
  }
  if(field.type === "select"){
    return `
      <div class="form-field ${field.full ? "full" : ""}">
        <label>${field.label}</label>
        <select name="${field.name}" ${field.required ? "required" : ""}>
          <option value="">Select...</option>
          ${field.options.map(option => `<option value="${escapeHtml(option)}" ${String(value) === String(option) ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      </div>
    `;
  }
  return `
    <div class="form-field ${field.full ? "full" : ""}">
      <label>${field.label}</label>
      <input 
        name="${field.name}" 
        type="${field.type || "text"}" 
        value="${escapeHtml(value)}"
        ${field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : ""}
        ${field.min !== undefined ? `min="${field.min}"` : ""}
        ${field.required ? "required" : ""}
      />
    </div>
  `;
}
function buildComputedBox(module){
  if(!module.computed) return "";
  return `
    <div class="calculated" id="computedBox">
      <div>Calculated Result</div>
      <strong>-</strong>
    </div>
  `;
}
function buildKpis(module, records){
  const items = module.summary ? module.summary(records) : [{ label:"Records", value: records.length }];
  return `
    <div class="kpi-grid">
      ${items.map(item => `
        <div class="kpi-card">
          <div class="small">${item.label}</div>
          <div class="big">${item.value}</div>
        </div>
      `).join("")}
    </div>
  `;
}
function renderRecordsTable(module, records){
  const columns = module.columns || Object.keys(records[0] || {});
  if(!records.length){
    return `<div class="empty-state">ยังไม่มีข้อมูลในโมดูลนี้</div>`;
  }
  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            ${columns.map(column => `<th>${humanize(column)}</th>`).join("")}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${records.slice().reverse().map(record => `
            <tr>
              ${columns.map(column => `<td>${formatCell(record[column])}</td>`).join("")}
              <td><button class="action-btn danger" data-delete-id="${record.id}">Delete</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
function humanize(value){
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, s => s.toUpperCase());
}
function formatCell(value){
  if(value === null || value === undefined || value === "") return "-";
  const text = String(value);
  if(["OK","Good","Open","Investigating","Claimed","Closed","Need Repair","Broken","Missing","Dirty","Torn","Receive","Send Laundry","Return","Transfer","Discard","Breakage","Spoiled"].includes(text)){
    return `<span class="record-badge ${badgeClass(text)}">${escapeHtml(text)}</span>`;
  }
  return escapeHtml(text);
}
function readForm(module, form){
  const payload = { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  module.fields.forEach(field => {
    payload[field.name] = form.elements[field.name].value;
  });
  if(module.computed){
    Object.assign(payload, module.computed(payload));
  }
  return payload;
}
function updateComputedPreview(module, form){
  if(!module.computed) return;
  const computedBox = document.getElementById("computedBox");
  if(!computedBox) return;
  const payload = {};
  module.fields.forEach(field => {
    payload[field.name] = form.elements[field.name].value;
  });
  const computed = module.computed(payload);
  const entries = Object.entries(computed);
  if(!entries.length) {
    computedBox.querySelector("strong").textContent = "-";
    return;
  }
  const label = humanize(entries[0][0]);
  const raw = entries[0][1];
  const value = entries[0][0].toLowerCase().includes("stock")
    ? formatNumber(raw)
    : formatCurrency(raw);
  computedBox.innerHTML = `<div>${label}</div><strong>${value}</strong>`;
}
function showDashboard(){
  dashboardView.classList.add("active");
  moduleView.classList.remove("active");
  renderNav("dashboard");
  renderDashboard();
  history.replaceState({}, "", "#dashboard");
}
function showModule(moduleId){
  const module = getModule(moduleId);
  if(!module) return;
  const records = getRecords(moduleId);

  dashboardView.classList.remove("active");
  moduleView.classList.add("active");
  renderNav(moduleId);
  history.replaceState({}, "", "#" + moduleId);

  moduleView.innerHTML = `
    <div class="module-shell">
      <div class="module-header">
        <div class="module-header-top">
          <div>
            <button class="back-btn" id="backBtn">← กลับหน้าเมนูหลัก</button>
          </div>
        </div>
        <div class="module-title-row" style="margin-top:18px">
          <div class="module-icon-large color-${module.color}">${module.icon}</div>
          <div>
            <h3>${module.title}</h3>
            <p>${module.description}</p>
          </div>
        </div>
        <div class="module-actions">
          <button class="action-btn primary color-${module.color}" id="exportBtn">Export CSV</button>
          <button class="action-btn danger" id="clearBtn">Clear All Records</button>
        </div>
      </div>

      ${buildKpis(module, records)}

      <div class="module-grid">
        <div class="panel">
          <h4>Add New Record</h4>
          <div class="panel-sub">${module.subtitle}</div>
          ${buildForm(module)}
          ${buildComputedBox(module)}
          <div class="footer-note">ข้อมูลที่บันทึกจะเก็บไว้ในเบราว์เซอร์ของเครื่องนี้ทันที</div>
        </div>

        <div class="panel">
          <h4>Recent Records</h4>
          <div class="panel-sub">สามารถลบรายการที่บันทึกผิดได้จากตารางด้านล่าง</div>
          ${renderRecordsTable(module, records.slice(-5))}
        </div>
      </div>

      <div class="panel">
        <h4>All Records</h4>
        <div class="panel-sub">รายการทั้งหมดของโมดูลนี้</div>
        ${renderRecordsTable(module, records)}
      </div>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", showDashboard);
  document.getElementById("exportBtn").addEventListener("click", () => {
    const rows = getRecords(moduleId);
    if(!rows.length){
      alert("ยังไม่มีข้อมูลสำหรับ export");
      return;
    }
    downloadFile(`${moduleId}.csv`, toCSV(rows));
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    if(confirm(`ลบข้อมูลทั้งหมดของ ${module.title} ?`)){
      saveRecords(moduleId, []);
      showModule(moduleId);
    }
  });

  const form = document.getElementById("moduleForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = readForm(module, form);
    const next = [...getRecords(moduleId), payload];
    saveRecords(moduleId, next);
    showModule(moduleId);
  });
  if(module.computed){
    form.addEventListener("input", () => updateComputedPreview(module, form));
    updateComputedPreview(module, form);
  }

  moduleView.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteId;
      const next = getRecords(moduleId).filter(record => record.id !== id);
      saveRecords(moduleId, next);
      showModule(moduleId);
    });
  });
}
function exportAllData(){
  const bundle = {};
  modules.forEach(module => {
    bundle[module.id] = getRecords(module.id);
  });
  downloadFile("laya-operations-data.json", JSON.stringify(bundle, null, 2), "application/json;charset=utf-8;");
}

document.querySelector('[data-target="dashboard"]').addEventListener("click", showDashboard);
exportAllBtn.addEventListener("click", exportAllData);

function boot(){
  renderNav("dashboard");
  renderDashboard();
  const hash = (location.hash || "").replace("#", "");
  if(hash && hash !== "dashboard" && getModule(hash)){
    showModule(hash);
  }else{
    showDashboard();
  }
}
boot();
