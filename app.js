const API = "https://generativelanguage.googleapis.com/v1beta";
const $ = id => document.getElementById(id);

const MODELS = {
  text: [
    {id:"gemini-3.6-flash", name:"Gemini 3.6 Flash", desc:"سريع ومتقدم للمهام اليومية والبرمجة"},
    {id:"gemini-3.5-flash", name:"Gemini 3.5 Flash", desc:"أداء قوي ومتوازن"},
    {id:"gemini-3.5-flash-lite", name:"Gemini 3.5 Flash-Lite", desc:"الأسرع والأكثر كفاءة للطلبات الكثيرة"},
    {id:"gemini-3.1-pro-preview", name:"Gemini 3.1 Pro Preview", desc:"تفكير واستدلال متقدم"},
    {id:"gemini-3.1-flash-lite", name:"Gemini 3.1 Flash-Lite", desc:"خفيف وسريع"},
    {id:"gemini-3-flash", name:"Gemini 3 Flash", desc:"نموذج Gemini 3 سريع ومتعدد الاستخدامات"}
  ],
  image: [
    {id:"gemini-3.1-flash-image", name:"Nano Banana 2", desc:"إنشاء وتعديل صور — الخيار الأساسي"},
    {id:"gemini-3.1-flash-lite-image", name:"Nano Banana 2 Lite", desc:"إنشاء وتعديل صور بسرعة وتكلفة منخفضة"},
    {id:"gemini-3-pro-image", name:"Nano Banana Pro", desc:"إنشاء احترافي وتحكم إبداعي متقدم"},
    {id:"gemini-2.5-flash-image", name:"Nano Banana", desc:"الإصدار السابق من Nano Banana"}
  ]
};

let mode = "chat";
// history is now an array of Gemini "contents" objects: {role:"user"|"model", parts:[...]}
// kept per-mode so switching between chat/vision/image doesn't mix contexts
let histories = { chat: [], vision: [] };
let attached = null;

function key(){ return localStorage.getItem("gemini_api_key") || ""; }

function setApiState(){
  const on = !!key();
  $("apiDot").classList.toggle("on", on);
  $("apiState").textContent = on ? "المفتاح محفوظ محليًا" : "المفتاح غير محفوظ";
}

function setStatus(t){ $("statusPill").textContent = t; }

function fillModels(){
  const list = mode === "image" ? MODELS.image : MODELS.text;
  const select = $("model");
  select.innerHTML = list.map((m,i)=>`<option value="${m.id}">${m.name}</option>`).join("");
  const saved = localStorage.getItem("gemini_model_"+mode);
  if(saved && list.some(x=>x.id===saved)) select.value=saved;
  updateModelInfo();
}

function updateModelInfo(){
  const list = mode === "image" ? MODELS.image : MODELS.text;
  const m = list.find(x=>x.id===$("model").value) || list[0];
  $("modelInfo").textContent = m.desc;
  localStorage.setItem("gemini_model_"+mode, m.id);
}

function setMode(next){
  mode=next;
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  $("modeKicker").textContent = mode==="image" ? "NANO BANANA" : mode==="vision" ? "GEMINI VISION" : "GEMINI CHAT";
  $("panelTitle").textContent = mode==="image" ? "أنشئ صورة بالذكاء الاصطناعي" : mode==="vision" ? "حلّل صورة مع Gemini" : "ماذا تريد أن نصنع اليوم؟";
  $("prompt").placeholder = mode==="image" ? "صف الصورة التي تريد إنشاءها..." : mode==="vision" ? "أرفق صورة واكتب ما تريد تحليله..." : "اكتب رسالتك هنا...";
  $("hint").textContent = mode==="image" ? "Nano Banana • إنشاء وتعديل الصور" : "Gemini API • المفتاح محفوظ محليًا في هذا المتصفح";
  fillModels();
  if(mode==="image") $("model").value = "gemini-3.1-flash-image";
}

function addMessage(role,text){
  const empty=$(".empty-state");
  if(empty) empty.remove();
  const row=document.createElement("div"); row.className=`msg ${role}`;
  const bubble=document.createElement("div"); bubble.className="bubble";
  bubble.textContent=text;
  row.appendChild(bubble); $("messages").appendChild(row);
  $("messages").scrollTop=$("messages").scrollHeight;
  return bubble;
}
function addImageMessage(base64,mime){
  const row=document.createElement("div"); row.className="msg ai";
  const bubble=document.createElement("div"); bubble.className="bubble";
  const img=document.createElement("img"); img.className="generated"; img.src=`data:${mime};base64,${base64}`;
  bubble.appendChild(img);
  const a=document.createElement("a"); a.className="download"; a.textContent="تحميل الصورة"; a.download="gemini-image.png"; a.href=img.src;
  bubble.appendChild(a); row.appendChild(bubble); $("messages").appendChild(row);
  $("messages").scrollTop=$("messages").scrollHeight;
}

function showAttachment(){
  const box=$("attachmentPreview");
  if(!attached){box.classList.add("hidden");box.innerHTML="";return}
  box.classList.remove("hidden");
  box.innerHTML=`<img src="${attached.dataUrl}"><span>${attached.file.name}</span><button type="button" id="removeAttachment">×</button>`;
  $("removeAttachment").onclick=()=>{attached=null;$("imageInput").value="";showAttachment()};
}

function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader(); r.onload=()=>resolve(r.result.split(",")[1]); r.onerror=reject; r.readAsDataURL(file);
  });
}
function fileDataUrl(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file);
  });
}

// Calls the REAL Gemini API generateContent endpoint.
// contents: array of {role, parts} objects (the full conversation so far, including the new user turn)
// extra: optional extra fields merged into the request body (e.g. generationConfig)
async function callGenerateContent(model, contents, extra={}){
  const body = { contents, ...extra };
  const r = await fetch(`${API}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key() },
    body: JSON.stringify(body)
  });
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error?.message || `HTTP ${r.status}`);
  return data;
}

function extractText(data){
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const chunks = parts.filter(p=>p.text).map(p=>p.text);
  return chunks.join("\n") || "لم يُرجع النموذج نصًا.";
}

function extractImage(data){
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for(const p of parts){
    if(p.inlineData?.data) return {data:p.inlineData.data, mime:p.inlineData.mimeType||"image/png"};
    if(p.inline_data?.data) return {data:p.inline_data.data, mime:p.inline_data.mime_type||"image/png"};
  }
  return null;
}

async function send(){
  const prompt=$("prompt").value.trim();
  if(!prompt && !attached) return;
  if(!key()){openApi();return}
  $("sendBtn").disabled=true; setStatus("جاري التنفيذ...");
  if(prompt) addMessage("user",prompt);
  $("prompt").value="";
  try{
    const model=$("model").value;
    let extra = {};
    let contents;

    if(mode==="vision"){
      if(!attached) throw new Error("أرفق صورة أولًا.");
      const b64=await fileToBase64(attached.file);
      const parts=[
        {text: prompt || "حلل هذه الصورة بالتفصيل."},
        {inlineData:{mimeType:attached.file.type, data:b64}}
      ];
      histories.vision.push({role:"user", parts});
      contents = histories.vision;
    }else if(mode==="image"){
      // Image generation/editing turns are sent standalone (no running text history)
      const parts=[{text: prompt || "أنشئ صورة جميلة."}];
      if(attached){
        const b64=await fileToBase64(attached.file);
        parts.push({inlineData:{mimeType:attached.file.type, data:b64}});
      }
      contents=[{role:"user", parts}];
      extra.generationConfig = { responseModalities: ["IMAGE","TEXT"] };
    }else{
      histories.chat.push({role:"user", parts:[{text:prompt}]});
      contents = histories.chat;
    }

    const data = await callGenerateContent(model, contents, extra);

    if(mode==="image"){
      const img=extractImage(data);
      if(img) addImageMessage(img.data,img.mime);
      else addMessage("ai",extractText(data));
    }else{
      const text = extractText(data);
      addMessage("ai",text);
      // keep the model's reply in history so the conversation stays multi-turn
      if(mode==="vision") histories.vision.push({role:"model", parts:[{text}]});
      else histories.chat.push({role:"model", parts:[{text}]});
    }
    setStatus("تم");
    attached=null;$("imageInput").value="";showAttachment();
  }catch(e){
    addMessage("ai","حدث خطأ: "+e.message);
    setStatus("تحقق من المفتاح والنموذج والحصة.");
  }finally{
    $("sendBtn").disabled=false;
  }
}

function openApi(){
  $("apiKey").value=key();
  $("apiTest").textContent="";
  $("apiDialog").showModal();
}
async function testKey(){
  const k=$("apiKey").value.trim();
  if(!k){$("apiTest").textContent="أدخل المفتاح أولًا.";return false}
  $("apiTest").textContent="جاري الاختبار...";
  try{
    const r=await fetch(`${API}/models/gemini-3.6-flash`,{headers:{"x-goog-api-key":k}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d?.error?.message||`HTTP ${r.status}`);
    localStorage.setItem("gemini_api_key",k); setApiState();
    $("apiTest").textContent="تم التحقق من المفتاح بنجاح.";
    return true;
  }catch(e){$("apiTest").textContent="فشل التحقق: "+e.message;return false}
}

$("composer").addEventListener("submit",e=>{e.preventDefault();send()});
$("apiBtn").onclick=openApi;$("apiMini").onclick=openApi;
$("showKey").onclick=()=>{$("apiKey").type=$("apiKey").type==="password"?"text":"password";$("showKey").textContent=$("apiKey").type==="password"?"إظهار":"إخفاء"};
$("saveKey").onclick=async e=>{e.preventDefault();if(await testKey()) $("apiDialog").close()};
$("clearBtn").onclick=()=>{histories={chat:[],vision:[]};$("messages").innerHTML=`<div class="empty-state"><div class="empty-icon">✦</div><h3>ابدأ تجربة Gemini</h3><p>اختر نموذجًا من القائمة واكتب طلبك بالأسفل.</p></div>`;setStatus("تم المسح")};
$("newChatBtn").onclick=()=>{$("clearBtn").click()};
$("imageModeBtn").onclick=()=>setMode("image");
$("model").onchange=updateModelInfo;
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
document.querySelectorAll("[data-quick]").forEach(b=>b.onclick=()=>{$("prompt").value=b.dataset.quick;$("prompt").focus()});
$("imageInput").onchange=async()=>{const f=$("imageInput").files[0];if(!f)return;if(f.size>8*1024*1024){alert("الحد الأقصى للصورة 8MB");return}$("prompt").focus();attached={file:f,dataUrl:await fileDataUrl(f)};showAttachment()};
$("prompt").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
$("prompt").addEventListener("input",e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,160)+"px"});
$("apiForm").addEventListener("close",()=>setApiState());
setApiState();fillModels();
