import { useState, useEffect } from "react";

const SK = "port_v4";
const CN = ["①","②","③","④","⑤","⑥"];

const POS = {
  thesis_long:  { label:"Thesis 장기",    bg:"#dbeafe", fg:"#1d4ed8" },
  catalyst_mid: { label:"Catalyst 단중기",bg:"#ffedd5", fg:"#ea580c" },
  mixed:        { label:"혼합",           bg:"#f3e8ff", fg:"#7c3aed" },
  momentum:     { label:"모멘텀",         bg:"#dcfce7", fg:"#16a34a" },
};
const RISK = {
  low:  { label:"🟢 낮음", bg:"#dcfce7", fg:"#16a34a" },
  mid:  { label:"🟡 중간", bg:"#fef9c3", fg:"#a16207" },
  high: { label:"🔴 높음", bg:"#fee2e2", fg:"#dc2626" },
};
const STA = {
  thesis_valid:  { label:"Thesis 유효",    bg:"#d1fae5", fg:"#059669" },
  catalyst_wait: { label:"카탈리스트 대기",bg:"#fef3c7", fg:"#d97706" },
  damage_sign:   { label:"훼손 징후",      bg:"#fee2e2", fg:"#dc2626" },
  monitoring:    { label:"모니터링 필요",  bg:"#f3f4f6", fg:"#6b7280" },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const fmtN = n => (n != null && !isNaN(n)) ? Number(n).toLocaleString("ko-KR") : "—";
const fmtM = n => {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1e8) return (n/1e8).toFixed(1)+"억";
  if (Math.abs(n) >= 1e4) return (n/1e4).toFixed(0)+"만";
  return fmtN(n);
};
const bS = (bg,c,bdr="1px solid #e5e7eb") => ({
  padding:"5px 11px",borderRadius:7,border:bdr,background:bg,color:c,
  fontSize:12,fontWeight:500,cursor:"pointer"
});
const IS = {width:"100%",padding:"7px 10px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13,outline:"none",boxSizing:"border-box",color:"#111827",background:"white"};
const LS = {display:"block",fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"};

function extractJSON(txt) {
  try { return JSON.parse(txt.trim()); } catch {}
  const s=txt.indexOf("{"),e=txt.lastIndexOf("}");
  if(s!==-1&&e>s){try{return JSON.parse(txt.slice(s,e+1));}catch{}}
  return null;
}

const INIT = [
  {id:uid(),type:"holding",name:"삼성전자",code:"005930",market:"KOSPI",
   thesis:"HBM3E 퀄 확보 + 파운드리 GAA 수율 개선. 10조 자사주 소각 프로그램으로 밸류 디스카운트 해소.",
   catalysts:[{text:"HBM3E 엔비디아 공식 퀄 통과",done:false,note:""},{text:"파운드리 2nm 수주 공시",done:false,note:""},{text:"분기별 자사주 소각 실행",done:false,note:""}],
   posType:"thesis_long",profitRule:"20% 수익 시 절반 익절, thesis 훼손 시 즉시 매도",
   riskLevel:"mid",status:"catalyst_wait",entryPrice:null,qty:null,currentPrice:null,changeRate:"",aiNote:""},
  {id:uid(),type:"holding",name:"심텍",code:"222800",market:"KOSDAQ",
   thesis:"CoS 기판 램프업 + HBM 사이클 수혜. FC-BGA 공급 타이트 구간 ASP 방어력 보유.",
   catalysts:[{text:"Q2 CoS 출하량/잠정실적",done:false,note:""},{text:"HBM4 사이클 개시 시 기판 수요 동반 상승",done:false,note:""}],
   posType:"catalyst_mid",profitRule:"카탈리스트 달성 시 30% 익절 후 재평가",
   riskLevel:"mid",status:"catalyst_wait",entryPrice:null,qty:null,currentPrice:null,changeRate:"",aiNote:""},
  {id:uid(),type:"holding",name:"티엘비",code:"356860",market:"KOSDAQ",
   thesis:"어드밴스드 패키징 기판 구조적 수혜. CoWoS 확대 장기 플레이. 2027 사이클이 본게임.",
   catalysts:[{text:"주요 고객사 수주 공시",done:false,note:""},{text:"2H26 어드밴스드 패키징 투자 재개 공식화",done:false,note:""}],
   posType:"thesis_long",profitRule:"2027 사이클 전까지 홀드. 50% 수익 구간 포지션 점검.",
   riskLevel:"low",status:"thesis_valid",entryPrice:null,qty:null,currentPrice:null,changeRate:"",aiNote:""},
  {id:uid(),type:"holding",name:"필옵틱스",code:"161580",market:"KOSDAQ",
   thesis:"유리기판 TGV 장비 글로벌 레퍼런스 1위. 5종 풀라인업. 앱솔릭스·삼성전기 양쪽 납품 이력.",
   catalysts:[{text:"삼성전기/앱솔릭스 양산 일정 공식 확정",done:false,note:""},{text:"인텔·AMD 채용 공식 발표",done:false,note:""},{text:"연내 대형 기판업체 공급 완료",done:false,note:""}],
   posType:"thesis_long",profitRule:"고위험. 분할 진입. 10% 손절선 엄수.",
   riskLevel:"high",status:"catalyst_wait",entryPrice:null,qty:null,currentPrice:null,changeRate:"",aiNote:""},
  {id:uid(),type:"holding",name:"현대모비스",code:"012330",market:"KOSPI",
   thesis:"현대차그룹 거버넌스 재편 핵심 수혜. 자사주 소각·배당 확대. Atlas 액추에이터 신사업.",
   catalysts:[{text:"SoftBank 풋옵션 6월 데드라인",done:false,note:""},{text:"지배구조 개편 공식 발표",done:false,note:""},{text:"Atlas 공급 계약 공시",done:false,note:""}],
   posType:"mixed",profitRule:"거버넌스 이벤트 전후 리밸런싱. 기본 홀드.",
   riskLevel:"low",status:"thesis_valid",entryPrice:null,qty:null,currentPrice:null,changeRate:"",aiNote:""},
  {id:uid(),type:"holding",name:"에이치브이엠",code:"295310",market:"KOSDAQ",
   thesis:"Ta 스퍼터링 타겟 글로벌 과점 + 우주 사업부 고성장. SpaceX 공급망 진입.",
   catalysts:[{text:"우주 매출 비중 50% 달성",done:false,note:""},{text:"Praxair Ta 타겟 반도체 퀄 통과",done:false,note:""},{text:"SpaceX 수주 증가",done:false,note:""}],
   posType:"thesis_long",profitRule:"고위험 소형주. 비중 상한 8%. 30% 하락 시 손절 검토.",
   riskLevel:"high",status:"catalyst_wait",entryPrice:86000,qty:null,currentPrice:null,changeRate:"",aiNote:""},
  {id:uid(),type:"holding",name:"HD현대마린솔루션",code:"443060",market:"KOSPI",
   thesis:"조선 MRO 리커링 매출 구조. 슈퍼사이클 발주 증가 → 2~3년 후 A/S 물량 고정.",
   catalysts:[{text:"수주잔고 갱신",done:false,note:""},{text:"스마트십 신규 계약",done:false,note:""},{text:"목표주가 괴리 해소",done:false,note:""}],
   posType:"thesis_long",profitRule:"장기 홀드. 연간 수주잔고 갱신으로 thesis 점검.",
   riskLevel:"low",status:"thesis_valid",entryPrice:null,qty:null,currentPrice:null,changeRate:"",aiNote:""},
  {id:uid(),type:"holding",name:"달바글로벌",code:"483650",market:"KOSDAQ",
   thesis:"K-뷰티 북미·유럽·중화권 동시 성장. 1Q26 어닝서프라이즈로 실적이 thesis 뒷받침.",
   catalysts:[{text:"1Q26 매출 1712억/영업이익 451억 확인",done:true,note:"1Q26 실적 공시 완료"},{text:"코스트코·얼타 재발주",done:false,note:""},{text:"유럽 채널 입점",done:false,note:""}],
   posType:"momentum",profitRule:"실적 모멘텀 추적. 분기 실적 미스 시 포지션 재평가.",
   riskLevel:"mid",status:"thesis_valid",entryPrice:null,qty:null,currentPrice:null,changeRate:"",aiNote:""},
];

function loadData() {
  try {
    const raw = localStorage.getItem(SK);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveData(d) {
  try {
    localStorage.setItem(SK, JSON.stringify(d));
  } catch {}
}

async function callGemini(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY not set");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const d = await res.json();
  const txt = d?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return extractJSON(txt);
}

function calcStock(s) {
  const e=s.entryPrice,q=s.qty,c=s.currentPrice;
  const buyAmt=(e&&q)?e*q:null;
  const evalAmt=(c&&q)?c*q:null;
  const profit=(buyAmt&&evalAmt)?evalAmt-buyAmt:null;
  const ret=(buyAmt&&evalAmt)?((evalAmt-buyAmt)/buyAmt*100):null;
  return {buyAmt,evalAmt,profit,ret};
}

function Chip({cfg}) {
  return <span style={{padding:"2px 9px",borderRadius:9999,fontSize:11,fontWeight:700,backgroundColor:cfg.bg,color:cfg.fg,whiteSpace:"nowrap",display:"inline-block",letterSpacing:"0.02em"}}>{cfg.label}</span>;
}

function FF({label,children,style}) {
  return <div style={style}><label style={LS}>{label}</label>{children}</div>;
}

function SummaryBar({stocks,cash,setCash}) {
  const holdings=stocks.filter(s=>s.type==="holding");
  const totalEval=holdings.reduce((a,s)=>{const{evalAmt}=calcStock(s);return a+(evalAmt||0);},0);
  const totalBuy=holdings.reduce((a,s)=>{const{buyAmt}=calcStock(s);return a+(buyAmt||0);},0);
  const totalAsset=totalEval+(cash||0);
  const totalProfit=totalEval-totalBuy;
  const totalRet=totalBuy>0?(totalProfit/totalBuy*100):null;
  const retC=totalRet===null?"#9ca3af":totalRet>=0?"#2563eb":"#dc2626";
  const [editing,setEditing]=useState(false);
  const [tmpCash,setTmpCash]=useState(cash||"");

  return (
    <div style={{background:"#1e293b",borderRadius:14,padding:"18px 24px",marginBottom:20,color:"white"}}>
      <div style={{display:"flex",gap:0,flexWrap:"wrap",alignItems:"stretch"}}>
        <div style={{flex:"1 1 160px",padding:"0 20px 0 0",borderRight:"1px solid #334155"}}>
          <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:6,letterSpacing:"0.06em"}}>총 평가자산</div>
          <div style={{fontSize:22,fontWeight:700}}>{totalAsset>0?fmtM(totalAsset)+"원":"—"}</div>
          {totalRet!==null&&<div style={{fontSize:13,color:retC,fontWeight:700,marginTop:4}}>{totalRet>=0?"+":""}{totalRet.toFixed(2)}% ({totalProfit>=0?"+":""}{fmtM(totalProfit)}원)</div>}
        </div>
        <div style={{flex:"1 1 140px",padding:"0 20px",borderRight:"1px solid #334155"}}>
          <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:6,letterSpacing:"0.06em"}}>주식 평가액</div>
          <div style={{fontSize:18,fontWeight:700}}>{totalEval>0?fmtM(totalEval)+"원":"—"}</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:4}}>{totalAsset>0?(totalEval/totalAsset*100).toFixed(1)+"%":""}</div>
        </div>
        <div style={{flex:"1 1 140px",padding:"0 20px",borderRight:"1px solid #334155"}}>
          <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:6,letterSpacing:"0.06em"}}>현금</div>
          {editing?(
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input autoFocus type="number" value={tmpCash}
                onChange={e=>setTmpCash(e.target.value)}
                onBlur={()=>{setCash(tmpCash?Number(tmpCash):0);setEditing(false);}}
                onKeyDown={e=>{if(e.key==="Enter"){setCash(tmpCash?Number(tmpCash):0);setEditing(false);}}}
                style={{width:110,padding:"4px 8px",borderRadius:6,border:"1px solid #475569",background:"#0f172a",color:"white",fontSize:13,outline:"none"}}/>
            </div>
          ):(
            <div onClick={()=>{setTmpCash(cash||"");setEditing(true);}} style={{cursor:"pointer"}}>
              <div style={{fontSize:18,fontWeight:700}}>{cash>0?fmtM(cash)+"원":<span style={{color:"#475569",fontSize:14}}>클릭하여 입력</span>}</div>
              <div style={{fontSize:12,color:"#64748b",marginTop:4}}>{totalAsset>0&&cash>0?(cash/totalAsset*100).toFixed(1)+"%":""}</div>
            </div>
          )}
        </div>
        <div style={{flex:"2 1 200px",padding:"0 0 0 20px",overflowX:"auto"}}>
          <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:8,letterSpacing:"0.06em"}}>종목별 비중</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {holdings.filter(s=>{const{evalAmt}=calcStock(s);return evalAmt>0;}).map(s=>{
              const{evalAmt}=calcStock(s);
              const pct=totalAsset>0?(evalAmt/totalAsset*100):0;
              return (
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:11,color:"#cbd5e1",minWidth:80,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</span>
                  <div style={{flex:1,height:5,background:"#334155",borderRadius:3,minWidth:40}}>
                    <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:"#3b82f6",borderRadius:3}}/>
                  </div>
                  <span style={{fontSize:11,color:"#94a3b8",minWidth:36,textAlign:"right"}}>{pct.toFixed(1)}%</span>
                </div>
              );
            })}
            {totalAsset>0&&cash>0&&(
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:11,color:"#cbd5e1",minWidth:80}}>현금</span>
                <div style={{flex:1,height:5,background:"#334155",borderRadius:3,minWidth:40}}>
                  <div style={{width:`${Math.min(cash/totalAsset*100,100)}%`,height:"100%",background:"#22c55e",borderRadius:3}}/>
                </div>
                <span style={{fontSize:11,color:"#94a3b8",minWidth:36,textAlign:"right"}}>{(cash/totalAsset*100).toFixed(1)}%</span>
              </div>
            )}
            {holdings.every(s=>!calcStock(s).evalAmt)&&<span style={{fontSize:12,color:"#475569"}}>현재가·수량 입력 후 표시됩니다</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StockCard({s,onEdit,onDelete,onMove,onCatToggle}) {
  const{buyAmt,evalAmt,profit,ret}=calcStock(s);
  const retC=ret===null?"#9ca3af":ret>=0?"#2563eb":"#dc2626";
  const profitC=profit===null?"#9ca3af":profit>=0?"#2563eb":"#dc2626";
  const crC=s.changeRate?.startsWith("+")||(!s.changeRate?.startsWith("-")&&s.changeRate?.match(/^\d/))?"#dc2626":s.changeRate?.startsWith("-")?"#2563eb":"#9ca3af";
  const mktC=s.market==="KOSPI"?"#1d4ed8":"#7c3aed";

  return (
    <div style={{background:"#f0f4f8",border:"1px solid #d1d9e6",borderRadius:14,padding:"18px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.07)",display:"flex",flexDirection:"column",gap:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
        <div style={{flex:1,minWidth:0}}>
          <span style={{fontWeight:800,fontSize:17,color:"#0f172a"}}>{s.name}</span>
          <span style={{fontSize:12,color:"#9ca3af",margin:"0 6px"}}>{s.code}</span>
          <span style={{padding:"1px 7px",borderRadius:4,fontSize:11,fontWeight:700,background:"#e8ecf4",color:mktC}}>{s.market}</span>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end",flexShrink:0}}>
          <Chip cfg={POS[s.posType]||POS.thesis_long}/>
          <Chip cfg={RISK[s.riskLevel]||RISK.mid}/>
          <Chip cfg={STA[s.status]||STA.catalyst_wait}/>
        </div>
      </div>

      <div style={{background:"#e8ecf4",borderRadius:10,padding:"11px 14px",borderLeft:"3px solid #3b82f6"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#3b82f6",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>📌 THESIS</div>
        <div style={{fontSize:13,color:"#1e293b",lineHeight:1.75,fontWeight:500}}>{s.thesis}</div>
      </div>

      <div style={{background:"#e8ecf4",borderRadius:10,padding:"11px 14px",borderLeft:"3px solid #8b5cf6"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#8b5cf6",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>⚡ CATALYST</div>
        {s.catalysts.map((cat,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:i<s.catalysts.length-1?7:0}}>
            <input type="checkbox" checked={cat.done} onChange={()=>onCatToggle(s.id,i)}
              style={{marginTop:3,cursor:"pointer",accentColor:"#8b5cf6",flexShrink:0}}/>
            <div>
              <span style={{fontSize:13,color:cat.done?"#94a3b8":"#1e293b",textDecoration:cat.done?"line-through":"none",lineHeight:1.55,fontWeight:cat.done?400:500}}>
                <span style={{color:cat.done?"#c4b5fd":"#8b5cf6",marginRight:5,fontWeight:800}}>{CN[i]||`${i+1}.`}</span>
                {cat.text}
              </span>
              {cat.note&&<div style={{fontSize:11,color:"#6366f1",marginTop:3,paddingLeft:16,fontWeight:500}}>→ {cat.note}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{background:"#e2e8f0",borderRadius:10,padding:"13px 14px"}}>
        <div style={{display:"flex",gap:0,marginBottom:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"#64748b",letterSpacing:"0.06em",marginBottom:3}}>진입가</div>
            <div style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{s.entryPrice?`${fmtN(s.entryPrice)}원`:"미설정"}</div>
            {s.qty&&<div style={{fontSize:11,color:"#64748b",marginTop:1}}>{fmtN(s.qty)}주</div>}
          </div>
          <div style={{width:1,background:"#cbd5e1",margin:"0 14px"}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"#64748b",letterSpacing:"0.06em",marginBottom:3}}>현재가</div>
            <div style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{s.currentPrice?`${fmtN(s.currentPrice)}원`:"—"}</div>
            {s.changeRate&&s.changeRate!=="N/A"&&<div style={{fontSize:11,color:crC,fontWeight:700,marginTop:1}}>{s.changeRate}</div>}
          </div>
          <div style={{width:1,background:"#cbd5e1",margin:"0 14px"}}/>
          <div style={{flex:1,textAlign:"right"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#64748b",letterSpacing:"0.06em",marginBottom:3}}>수익률</div>
            <div style={{fontSize:26,fontWeight:800,color:retC,lineHeight:1.1}}>
              {ret!==null?`${ret>=0?"+":""}${ret.toFixed(2)}%`:"—"}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:0,paddingTop:10,borderTop:"1px solid #cbd5e1"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"#64748b",letterSpacing:"0.06em",marginBottom:2}}>매수금액</div>
            <div style={{fontSize:13,fontWeight:600,color:"#334155"}}>{buyAmt?fmtM(buyAmt)+"원":"—"}</div>
          </div>
          <div style={{width:1,background:"#cbd5e1",margin:"0 14px"}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"#64748b",letterSpacing:"0.06em",marginBottom:2}}>평가금액</div>
            <div style={{fontSize:13,fontWeight:600,color:"#334155"}}>{evalAmt?fmtM(evalAmt)+"원":"—"}</div>
          </div>
          <div style={{width:1,background:"#cbd5e1",margin:"0 14px"}}/>
          <div style={{flex:1,textAlign:"right"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#64748b",letterSpacing:"0.06em",marginBottom:2}}>수익금액</div>
            <div style={{fontSize:13,fontWeight:700,color:profitC}}>{profit!==null?`${profit>=0?"+":""}${fmtM(profit)}원`:"—"}</div>
          </div>
        </div>
      </div>

      <div style={{fontSize:12,color:"#475569",lineHeight:1.65,background:"#e8ecf4",borderRadius:8,padding:"8px 12px"}}>
        <span style={{fontWeight:700,color:"#64748b",marginRight:5}}>🛡 수익보호</span>{s.profitRule||"미설정"}
      </div>

      {s.aiNote&&(
        <div style={{padding:"9px 13px",background:"#f0f9ff",borderRadius:8,borderLeft:"3px solid #38bdf8",fontSize:12,color:"#0369a1",lineHeight:1.75}}>
          <span style={{fontWeight:700}}>🤖 AI 점검 · </span>{s.aiNote}
        </div>
      )}

      <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",paddingTop:8,borderTop:"1px solid #d1d9e6",gap:6}}>
        <button onClick={()=>onMove(s.id)} style={bS("#e8ecf4","#475569","1px solid #cbd5e1")}>{s.type==="holding"?"→관심":"→보유"}</button>
        <button onClick={()=>onEdit(s)} style={bS("#e8ecf4","#1e293b","1px solid #cbd5e1")}>편집</button>
        <button onClick={()=>onDelete(s.id)} style={bS("#fee2e2","#dc2626","1px solid #fecaca")}>삭제</button>
      </div>
    </div>
  );
}

const EMPTY=(type="holding")=>({
  id:uid(),type,name:"",code:"",market:"KOSPI",thesis:"",
  catalysts:[{text:"",done:false,note:""},{text:"",done:false,note:""},{text:"",done:false,note:""}],
  posType:"thesis_long",profitRule:"",riskLevel:"mid",status:"catalyst_wait",
  entryPrice:null,qty:null,currentPrice:null,changeRate:"",aiNote:"",
});

function EditModal({stock,onSave,onClose}) {
  const isNew=!!stock._new;
  const [f,setF]=useState(()=>isNew?EMPTY(stock.type||"holding"):{...stock});
  const [aiLoading,setAiLoading]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const setCat=(i,k,v)=>setF(p=>({...p,catalysts:p.catalysts.map((c,j)=>j===i?{...c,[k]:v}:c)}));
  const addCat=()=>setF(p=>({...p,catalysts:[...p.catalysts,{text:"",done:false,note:""}]}));
  const delCat=i=>setF(p=>({...p,catalysts:p.catalysts.filter((_,j)=>j!==i)}));

  const handleAiFill=async()=>{
    if(!f.name.trim()||!f.code.trim()){alert("종목명과 코드를 먼저 입력해주세요.");return;}
    setAiLoading(true);
    try{
      const existingCats=f.catalysts.filter(c=>c.text.trim()).map((c,i)=>`${i+1}. [${c.done?"완료":"미완료"}] ${c.text}`).join("\n");
      const prompt=`"${f.name}" (종목코드: ${f.code}, ${f.market}) 종목에 대해 최신 뉴스와 공시를 검색하여 투자 분석을 작성해주세요.
${existingCats?`\n현재 카탈리스트:\n${existingCats}\n`:""}
다음 JSON 형식으로만 응답하세요:
{
  "thesis": "핵심 투자 thesis (한국어, 2-4문장, 투자 근거와 차별화 포인트)",
  "catalysts": [
    {"text": "카탈리스트 항목명", "done": false, "note": ""},
    {"text": "카탈리스트 항목명", "done": false, "note": ""},
    {"text": "카탈리스트 항목명", "done": false, "note": ""}
  ],
  "status": "thesis_valid" | "catalyst_wait" | "damage_sign" | "monitoring",
  "posType": "thesis_long" | "catalyst_mid" | "mixed" | "momentum",
  "summary": "현재 투자 포인트 및 주요 이슈 2-3문장"
}`;
      const r=await callGemini(prompt);
      if(r){
        setF(p=>({
          ...p,
          thesis:r.thesis||p.thesis,
          catalysts:r.catalysts?.length?r.catalysts.map(c=>({text:c.text||"",done:c.done||false,note:c.note||""})):p.catalysts,
          status:r.status||p.status,
          posType:r.posType||p.posType,
          aiNote:r.summary||p.aiNote,
        }));
      }else{
        alert("AI 응답 파싱 실패. 다시 시도해주세요.");
      }
    }catch(e){
      alert(`AI 오류: ${e.message}`);
    }finally{
      setAiLoading(false);
    }
  };

  const submit=()=>{
    if(!f.name.trim()||!f.code.trim()){alert("종목명과 코드를 입력해주세요.");return;}
    onSave(f);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:16,padding:24,width:"100%",maxWidth:580,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.18)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:18,color:"#111827"}}>{isNew?"종목 추가":`${f.name} 수정`}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={handleAiFill} disabled={aiLoading} style={{padding:"6px 14px",borderRadius:8,border:"none",background:aiLoading?"#e5e7eb":"#7c3aed",color:aiLoading?"#9ca3af":"white",fontWeight:600,fontSize:12,cursor:aiLoading?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
              {aiLoading?"⏳ AI 분석 중...":"🤖 AI 자동입력"}
            </button>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#9ca3af",lineHeight:1,padding:0}}>×</button>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",gap:10}}>
            <FF label="종목명" style={{flex:2}}><input value={f.name} onChange={e=>set("name",e.target.value)} style={IS}/></FF>
            <FF label="코드" style={{flex:1}}><input value={f.code} onChange={e=>set("code",e.target.value)} style={IS}/></FF>
            <FF label="시장" style={{flex:1}}>
              <select value={f.market} onChange={e=>set("market",e.target.value)} style={IS}>
                <option>KOSPI</option><option>KOSDAQ</option>
              </select>
            </FF>
          </div>
          <div style={{display:"flex",gap:10}}>
            <FF label="진입가 (원)" style={{flex:1}}>
              <input type="number" value={f.entryPrice||""} onChange={e=>set("entryPrice",e.target.value?Number(e.target.value):null)} placeholder="예: 62000" style={IS}/>
            </FF>
            <FF label="보유수량 (주)" style={{flex:1}}>
              <input type="number" value={f.qty||""} onChange={e=>set("qty",e.target.value?Number(e.target.value):null)} placeholder="예: 100" style={IS}/>
            </FF>
          </div>
          <FF label="Thesis">
            <textarea value={f.thesis} onChange={e=>set("thesis",e.target.value)} rows={3} style={{...IS,resize:"vertical",lineHeight:1.65}}/>
          </FF>
          <div>
            <div style={LS}>Catalyst</div>
            {f.catalysts.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
                <span style={{color:"#8b5cf6",fontSize:13,minWidth:18,textAlign:"center",flexShrink:0,fontWeight:700}}>{CN[i]||`${i+1}.`}</span>
                <input value={c.text} onChange={e=>setCat(i,"text",e.target.value)} placeholder={`카탈리스트 ${i+1}`} style={{...IS,flex:1}}/>
                {f.catalysts.length>1&&<button onClick={()=>delCat(i)} style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:18,padding:"0 4px",flexShrink:0,lineHeight:1}}>×</button>}
              </div>
            ))}
            <button onClick={addCat} style={{fontSize:12,color:"#7c3aed",background:"none",border:"1px dashed #c4b5fd",borderRadius:6,padding:"4px 14px",cursor:"pointer"}}>+ 카탈리스트 추가</button>
          </div>
          <div style={{display:"flex",gap:10}}>
            <FF label="포지션 성격" style={{flex:1}}>
              <select value={f.posType} onChange={e=>set("posType",e.target.value)} style={IS}>
                {Object.entries(POS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </FF>
            <FF label="리스크" style={{flex:1}}>
              <select value={f.riskLevel} onChange={e=>set("riskLevel",e.target.value)} style={IS}>
                {Object.entries(RISK).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </FF>
            <FF label="현재 상태" style={{flex:1}}>
              <select value={f.status} onChange={e=>set("status",e.target.value)} style={IS}>
                {Object.entries(STA).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </FF>
          </div>
          <div style={{display:"flex",gap:10}}>
            <FF label="수익보호 규칙" style={{flex:2}}>
              <input value={f.profitRule} onChange={e=>set("profitRule",e.target.value)} style={IS}/>
            </FF>
            <FF label="구분" style={{flex:1}}>
              <select value={f.type} onChange={e=>set("type",e.target.value)} style={IS}>
                <option value="holding">보유종목</option>
                <option value="watchlist">관심종목</option>
              </select>
            </FF>
          </div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:"1px solid #f3f4f6"}}>
          <button onClick={onClose} style={{padding:"9px 20px",borderRadius:8,border:"1px solid #e5e7eb",background:"white",color:"#6b7280",fontWeight:500,cursor:"pointer"}}>취소</button>
          <button onClick={submit} style={{padding:"9px 24px",borderRadius:8,border:"none",background:"#2563eb",color:"white",fontWeight:600,cursor:"pointer",fontSize:14}}>{isNew?"추가하기":"저장"}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [stocks,setStocks]=useState([]);
  const [cash,setCashState]=useState(0);
  const [tab,setTab]=useState("holding");
  const [busy,setBusy]=useState(false);
  const [busyMode,setBusyMode]=useState("");
  const [prog,setProg]=useState({n:0,total:0});
  const [modal,setModal]=useState(null);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const d=loadData();
    if(d){setStocks(d.stocks||d||INIT);setCashState(d.cash||0);}
    else setStocks(INIT);
    setReady(true);
  },[]);

  const setCash=v=>{setCashState(v);};
  useEffect(()=>{if(ready)saveData({stocks,cash});},[stocks,cash,ready]);

  const upd=fn=>setStocks(p=>fn(p));
  const catToggle=(id,i)=>upd(p=>p.map(s=>s.id===id?{...s,catalysts:s.catalysts.map((c,j)=>j===i?{...c,done:!c.done}:c)}:s));
  const moveTab=id=>upd(p=>p.map(s=>s.id===id?{...s,type:s.type==="holding"?"watchlist":"holding"}:s));
  const delStock=id=>{if(window.confirm("이 종목을 삭제할까요?"))upd(p=>p.filter(s=>s.id!==id));};
  const saveStock=stock=>{
    upd(p=>{const i=p.findIndex(s=>s.id===stock.id);return i>=0?p.map(s=>s.id===stock.id?stock:s):[...p,stock];});
    setModal(null);
  };

  const fetchWithTimeout=async(url,opts,ms=25000)=>{
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),ms);
    try{const r=await fetch(url,{...opts,signal:ctrl.signal});clearTimeout(timer);return r;}
    catch(e){clearTimeout(timer);throw e;}
  };
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  const fetchYahooPrice=async(code,market)=>{
    const res=await fetchWithTimeout(
      `http://localhost:3001/quote?code=${code}&market=${market}`,
      {headers:{"Accept":"application/json"}},
      15000
    );
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const d=await res.json();
    const meta=d?.chart?.result?.[0]?.meta;
    if(!meta?.regularMarketPrice)throw new Error("no data");
    const price=Math.round(meta.regularMarketPrice);
    const prev=meta.chartPreviousClose||meta.previousClose;
    const pct=prev?((meta.regularMarketPrice-prev)/prev*100):null;
    const rate=pct!=null?`${pct>=0?"+":""}${pct.toFixed(2)}%`:"";
    return{price,changeRate:rate};
  };

  const handlePrices=async()=>{
    setBusy(true);setBusyMode("price");
    const all=[...stocks];setProg({n:0,total:all.length});
    const errors=[];
    for(let i=0;i<all.length;i++){
      const s=all[i];setProg({n:i,total:all.length});
      try{
        const r=await fetchYahooPrice(s.code,s.market);
        if(r?.price){
          upd(p=>p.map(x=>x.id===s.id?{...x,currentPrice:r.price,changeRate:r.changeRate||""}:x));
        }else{
          errors.push(s.name+"(데이터 없음)");
        }
      }catch(e){
        console.warn(`[현재가 실패] ${s.name}:`,e?.message);
        errors.push(s.name);
      }
      setProg({n:i+1,total:all.length});
      if(i<all.length-1)await sleep(1200);
    }
    setBusy(false);setBusyMode("");
    if(errors.length>0)alert(`조회 실패 종목: ${errors.join(", ")}`);
  };

  const handleCatalysts=async()=>{
    setBusy(true);setBusyMode("catalyst");
    const all=[...stocks];setProg({n:0,total:all.length});
    for(let i=0;i<all.length;i++){
      const s=all[i];setProg({n:i,total:all.length});
      try{
        const cats=s.catalysts.map((c,idx)=>`${idx+1}. [${c.done?"완료":"미완료"}] ${c.text}${c.note?` (메모: ${c.note})`:""}` ).join("\n");
        const prompt=`최신 한국 주식 뉴스와 공시를 검색하여 "${s.name}" (종목코드: ${s.code}) 종목을 점검해주세요.

현재 Thesis: ${s.thesis}
현재 Catalysts:
${cats}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "thesis": "최신 정보를 반영한 thesis 업데이트 (기존 thesis를 바탕으로 새로운 정보 추가/수정, 한국어, 2-4문장)",
  "catalysts": [
    {"text": "카탈리스트 항목명", "done": true/false, "note": "최신 진행상황 한국어 메모"}
  ],
  "new_catalysts": [
    {"text": "새로 발굴한 카탈리스트 (없으면 빈 배열)"}
  ],
  "status": "thesis_valid" | "catalyst_wait" | "damage_sign" | "monitoring",
  "summary": "현재 투자 포인트 및 주요 이슈 2-3문장 한국어 요약"
}

주의: catalysts 배열은 기존 항목 순서 그대로 유지, new_catalysts는 기존에 없는 새 항목만 추가`;
        const r=await callGemini(prompt);
        if(r){
          upd(p=>p.map(x=>{
            if(x.id!==s.id)return x;
            // 기존 카탈리스트 업데이트
            const nc=x.catalysts.map((c,idx)=>{
              const u=r.catalysts?.[idx];
              return u?{...c,done:u.done!==undefined?u.done:c.done,note:u.note||c.note,text:u.text||c.text}:c;
            });
            // 신규 카탈리스트 추가
            const added=(r.new_catalysts||[]).filter(n=>n.text?.trim()).map(n=>({text:n.text,done:false,note:""}));
            return{
              ...x,
              thesis:r.thesis||x.thesis,
              catalysts:[...nc,...added],
              status:r.status||x.status,
              aiNote:r.summary||x.aiNote,
            };
          }));
        }
      }catch(e){console.warn(`[종목점검] ${s.name} 실패:`,e?.message);}
      setProg({n:i+1,total:all.length});
      if(i<all.length-1)await sleep(800);
    }
    setBusy(false);setBusyMode("");
  };

  const filtered=stocks.filter(s=>s.type===tab);
  const hCnt=stocks.filter(s=>s.type==="holding").length;
  const wCnt=stocks.filter(s=>s.type==="watchlist").length;
  const busyLabel=busyMode==="price"?`📈 현재가 조회 중 · ${prog.n}/${prog.total}`:busyMode==="catalyst"?`🔍 종목점검 중 · ${prog.n}/${prog.total}`:"";

  return (
    <div style={{minHeight:"100vh",background:"#e8ecf4",fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <div style={{background:"#1e293b",borderBottom:"1px solid #334155",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>📊</span>
            <span style={{fontWeight:800,fontSize:17,color:"white",letterSpacing:"-0.02em"}}>포트폴리오 매니저</span>
          </div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button onClick={handlePrices} disabled={busy} style={{padding:"7px 14px",borderRadius:8,border:"none",background:busy?"#334155":"#2563eb",color:busy?"#64748b":"white",fontWeight:700,fontSize:13,cursor:busy?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
              📈 현재가 업데이트
            </button>
            <button onClick={handleCatalysts} disabled={busy} style={{padding:"7px 14px",borderRadius:8,border:"none",background:busy?"#334155":"#7c3aed",color:busy?"#64748b":"white",fontWeight:700,fontSize:13,cursor:busy?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
              🔍 종목점검
            </button>
            <button onClick={()=>setModal({_new:true,type:tab})} disabled={busy} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#059669",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              + 추가
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1280,margin:"0 auto",padding:"20px 20px 48px"}}>
        <SummaryBar stocks={stocks} cash={cash} setCash={v=>{setCashState(v);}}/>

        <div style={{display:"flex",gap:6,marginBottom:18}}>
          {[["holding",`보유종목 ${hCnt}`],["watchlist",`관심종목 ${wCnt}`]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{
              padding:"8px 20px",borderRadius:20,
              border:`2px solid ${tab===v?"#2563eb":"#d1d9e6"}`,
              background:tab===v?"#2563eb":"white",
              color:tab===v?"white":"#475569",
              fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.15s"
            }}>{l}</button>
          ))}
        </div>

        {busy&&(
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
            <div style={{fontSize:13,color:"#374151",fontWeight:600,marginBottom:7}}>{busyLabel}</div>
            <div style={{height:5,background:"#e5e7eb",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",background:busyMode==="price"?"#2563eb":"#7c3aed",borderRadius:3,width:`${prog.total?(prog.n/prog.total*100):0}%`,transition:"width 0.3s"}}/>
            </div>
            <div style={{fontSize:11,color:"#9ca3af",marginTop:5}}>{prog.n}/{prog.total} 완료</div>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(420px,1fr))",gap:16}}>
          {filtered.map(s=>(
            <StockCard key={s.id} s={s} onEdit={setModal} onDelete={delStock} onMove={moveTab} onCatToggle={catToggle}/>
          ))}
          {filtered.length===0&&(
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"64px 20px",color:"#9ca3af"}}>
              <div style={{fontSize:44,marginBottom:14}}>📋</div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:6}}>종목이 없습니다</div>
              <div style={{fontSize:13}}>+ 추가 버튼으로 종목을 등록해보세요</div>
            </div>
          )}
        </div>
      </div>

      {modal&&<EditModal stock={modal} onSave={saveStock} onClose={()=>setModal(null)}/>}
    </div>
  );
}
