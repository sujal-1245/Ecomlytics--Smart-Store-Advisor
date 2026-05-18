// import { useState, useRef, useEffect, useMemo } from "react";
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";

// // ─── COMPLETE DATA ────────────────────────────────────────────────────────────
// const DATA = {"daily":[{"date":"2026-01-08","revenue":1000601.86,"orders":662,"views":8810},{"date":"2026-01-09","revenue":818745.77,"orders":645,"views":10040},{"date":"2026-01-10","revenue":1904904.73,"orders":1174,"views":14487},{"date":"2026-01-11","revenue":1716620.19,"orders":956,"views":13609},{"date":"2026-01-12","revenue":1509919.88,"orders":768,"views":10902},{"date":"2026-01-13","revenue":1360244.85,"orders":782,"views":11608},{"date":"2026-01-14","revenue":1819341.04,"orders":837,"views":9216},{"date":"2026-01-15","revenue":1200439.07,"orders":716,"views":9721},{"date":"2026-01-16","revenue":1396455.91,"orders":776,"views":12383},{"date":"2026-01-17","revenue":1792442.69,"orders":1035,"views":14765},{"date":"2026-01-18","revenue":1661735.29,"orders":960,"views":12862},{"date":"2026-01-19","revenue":895079.93,"orders":692,"views":10387},{"date":"2026-01-20","revenue":1537687.65,"orders":801,"views":10060},{"date":"2026-01-21","revenue":1207343.78,"orders":621,"views":10761},{"date":"2026-01-22","revenue":1238036.13,"orders":677,"views":10306},{"date":"2026-01-23","revenue":1106137.88,"orders":717,"views":10039},{"date":"2026-01-24","revenue":1380473.54,"orders":949,"views":14327},{"date":"2026-01-25","revenue":1717509.68,"orders":950,"views":12864},{"date":"2026-01-26","revenue":1353394.09,"orders":695,"views":9974},{"date":"2026-01-27","revenue":1144965.0,"orders":623,"views":10560},{"date":"2026-01-28","revenue":1576203.28,"orders":801,"views":10746},{"date":"2026-01-29","revenue":1518792.89,"orders":838,"views":11216},{"date":"2026-01-30","revenue":1235075.67,"orders":708,"views":9908},{"date":"2026-01-31","revenue":1525576.53,"orders":885,"views":11456},{"date":"2026-02-01","revenue":2251756.75,"orders":1227,"views":17636},{"date":"2026-02-02","revenue":1088594.38,"orders":652,"views":9612},{"date":"2026-02-03","revenue":1370495.76,"orders":807,"views":11640},{"date":"2026-02-04","revenue":1364448.86,"orders":783,"views":10393},{"date":"2026-02-05","revenue":1644706.07,"orders":812,"views":10325},{"date":"2026-02-06","revenue":1083801.67,"orders":712,"views":11015},{"date":"2026-02-07","revenue":1947423.15,"orders":1045,"views":15252},{"date":"2026-02-08","revenue":2029372.48,"orders":1163,"views":15021},{"date":"2026-02-09","revenue":1321342.64,"orders":696,"views":10325},{"date":"2026-02-10","revenue":1528435.21,"orders":812,"views":9401},{"date":"2026-02-11","revenue":1046414.73,"orders":768,"views":9739},{"date":"2026-02-12","revenue":1176724.74,"orders":738,"views":10651},{"date":"2026-02-13","revenue":1583790.13,"orders":844,"views":9437},{"date":"2026-02-14","revenue":2155070.26,"orders":1013,"views":12820},{"date":"2026-02-15","revenue":1544895.76,"orders":887,"views":12664},{"date":"2026-02-16","revenue":1356937.99,"orders":730,"views":10221},{"date":"2026-02-17","revenue":2108742.54,"orders":1016,"views":12315},{"date":"2026-02-18","revenue":1520073.32,"orders":785,"views":9602},{"date":"2026-02-19","revenue":1484714.67,"orders":725,"views":9333},{"date":"2026-02-20","revenue":1558106.55,"orders":825,"views":12578},{"date":"2026-02-21","revenue":8849391.66,"orders":4464,"views":49791},{"date":"2026-02-22","revenue":4454361.11,"orders":2491,"views":44199},{"date":"2026-02-23","revenue":4008558.19,"orders":2189,"views":34338},{"date":"2026-02-24","revenue":1236439.32,"orders":743,"views":10887},{"date":"2026-02-25","revenue":1723652.34,"orders":868,"views":11159},{"date":"2026-02-26","revenue":1209545.51,"orders":739,"views":10329},{"date":"2026-02-27","revenue":1201743.45,"orders":762,"views":11269},{"date":"2026-02-28","revenue":1462804.7,"orders":981,"views":12944},{"date":"2026-03-01","revenue":1882520.84,"orders":1037,"views":14922},{"date":"2026-03-02","revenue":1239876.62,"orders":627,"views":9535},{"date":"2026-03-03","revenue":1571428.71,"orders":898,"views":11507},{"date":"2026-03-04","revenue":1334115.65,"orders":763,"views":9303},{"date":"2026-03-05","revenue":1339803.59,"orders":855,"views":10581},{"date":"2026-03-06","revenue":1545119.55,"orders":729,"views":10651},{"date":"2026-03-07","revenue":2246219.97,"orders":1100,"views":13536},{"date":"2026-03-08","revenue":1415634.58,"orders":865,"views":14256},{"date":"2026-03-09","revenue":986455.3,"orders":578,"views":9049},{"date":"2026-03-10","revenue":1377759.85,"orders":711,"views":9207},{"date":"2026-03-11","revenue":1405033.71,"orders":813,"views":10993},{"date":"2026-03-12","revenue":1286846.88,"orders":716,"views":11237},{"date":"2026-03-13","revenue":1210081.26,"orders":747,"views":10018},{"date":"2026-03-14","revenue":1466935.25,"orders":984,"views":12469},{"date":"2026-03-15","revenue":1350893.82,"orders":883,"views":11679},{"date":"2026-03-16","revenue":1179783.58,"orders":612,"views":9612},{"date":"2026-03-17","revenue":918033.09,"orders":561,"views":10216},{"date":"2026-03-18","revenue":1498327.56,"orders":749,"views":9528},{"date":"2026-03-19","revenue":1213078.51,"orders":715,"views":9129},{"date":"2026-03-20","revenue":1657744.92,"orders":818,"views":10660},{"date":"2026-03-21","revenue":1019471.07,"orders":738,"views":11105},{"date":"2026-03-22","revenue":1175497.32,"orders":752,"views":12038},{"date":"2026-03-23","revenue":229238.28,"orders":130,"views":1923},{"date":"2026-03-24","revenue":160502.08,"orders":86,"views":1752},{"date":"2026-03-25","revenue":117636.59,"orders":91,"views":1746},{"date":"2026-03-26","revenue":1217744.6,"orders":572,"views":8512},{"date":"2026-03-27","revenue":1089724.11,"orders":632,"views":8391},{"date":"2026-03-28","revenue":1522390.13,"orders":841,"views":10499},{"date":"2026-03-29","revenue":1183474.15,"orders":723,"views":9653},{"date":"2026-03-30","revenue":1314034.55,"orders":670,"views":8460},{"date":"2026-03-31","revenue":1402805.0,"orders":756,"views":9351},{"date":"2026-04-01","revenue":1060293.71,"orders":676,"views":8256},{"date":"2026-04-02","revenue":1290205.37,"orders":636,"views":8308},{"date":"2026-04-03","revenue":1219531.12,"orders":549,"views":7558},{"date":"2026-04-04","revenue":1268816.74,"orders":757,"views":11609},{"date":"2026-04-05","revenue":1224598.78,"orders":640,"views":9239},{"date":"2026-04-06","revenue":992478.14,"orders":560,"views":8544},{"date":"2026-04-07","revenue":1222197.44,"orders":561,"views":7890}],"products":[{"product":"Smart Watch","category":"Electronics","revenue":27396710,"orders":5501,"views":78542,"price":4999,"conversion_rate":7.0,"segment":"Top Earner"},{"product":"Running Shoes","category":"Clothing","revenue":23054017,"orders":6588,"views":89519,"price":3499,"conversion_rate":7.36,"segment":"Top Earner"},{"product":"Air Fryer","category":"Home & Kitchen","revenue":18888720,"orders":4743,"views":64995,"price":3999,"conversion_rate":7.3,"segment":"Top Earner"},{"product":"Wireless Earbuds","category":"Electronics","revenue":14365850,"orders":5758,"views":80982,"price":2499,"conversion_rate":7.11,"segment":"Top Earner"},{"product":"Coffee Maker","category":"Home & Kitchen","revenue":7299900,"orders":2592,"views":33212,"price":2799,"conversion_rate":7.8,"segment":"Growing"},{"product":"Denim Jacket","category":"Clothing","revenue":7149733,"orders":3249,"views":46682,"price":2199,"conversion_rate":6.96,"segment":"Needs Review"},{"product":"Webcam","category":"Electronics","revenue":4254582,"orders":2838,"views":38938,"price":1499,"conversion_rate":7.29,"segment":"Needs Review"},{"product":"Hoodie","category":"Clothing","revenue":3415684,"orders":2146,"views":30174,"price":1599,"conversion_rate":7.11,"segment":"Needs Review"},{"product":"Blender","category":"Home & Kitchen","revenue":3352606,"orders":1530,"views":24036,"price":2199,"conversion_rate":6.37,"segment":"Needs Review"},{"product":"Bluetooth Speaker","category":"Electronics","revenue":2816911,"orders":1477,"views":20784,"price":1899,"conversion_rate":7.11,"segment":"Needs Review"},{"product":"Lipstick Set","category":"Beauty","revenue":2430069,"orders":3075,"views":43299,"price":799,"conversion_rate":7.10,"segment":"Needs Review"},{"product":"Face Serum","category":"Beauty","revenue":2341550,"orders":2607,"views":35010,"price":899,"conversion_rate":7.45,"segment":"Growing"},{"product":"Summer Dress","category":"Clothing","revenue":2316484,"orders":1790,"views":23414,"price":1299,"conversion_rate":7.65,"segment":"Growing"},{"product":"Knife Set","category":"Home & Kitchen","revenue":2084198,"orders":1386,"views":19755,"price":1499,"conversion_rate":7.02,"segment":"Needs Review"},{"product":"Foam Roller","category":"Sports","revenue":1842031,"orders":2635,"views":39336,"price":699,"conversion_rate":6.70,"segment":"Needs Review"},{"product":"Resistance Bands","category":"Sports","revenue":1595684,"orders":3201,"views":43226,"price":499,"conversion_rate":7.41,"segment":"Growing"},{"product":"Yoga Pants","category":"Clothing","revenue":1398449,"orders":1405,"views":20778,"price":999,"conversion_rate":6.76,"segment":"Needs Review"},{"product":"Zero to One","category":"Books","revenue":1265405,"orders":3323,"views":44166,"price":379,"conversion_rate":7.52,"segment":"Growing"},{"product":"Gym Gloves","category":"Sports","revenue":1248493,"orders":3562,"views":47556,"price":349,"conversion_rate":7.49,"segment":"Growing"},{"product":"Python Cookbook","category":"Books","revenue":1242867,"orders":2070,"views":27434,"price":599,"conversion_rate":7.55,"segment":"Growing"},{"product":"The Lean Startup","category":"Books","revenue":989668,"orders":2746,"views":38742,"price":359,"conversion_rate":7.09,"segment":"Needs Review"},{"product":"Hair Mask","category":"Beauty","revenue":908627,"orders":1809,"views":23188,"price":499,"conversion_rate":7.80,"segment":"Growing"},{"product":"Water Bottle","category":"Sports","revenue":854860,"orders":2139,"views":27242,"price":399,"conversion_rate":7.85,"segment":"Growing"},{"product":"Sunscreen SPF50","category":"Beauty","revenue":805694,"orders":2300,"views":34706,"price":349,"conversion_rate":6.63,"segment":"Needs Review"},{"product":"Atomic Habits","category":"Books","revenue":635353,"orders":1580,"views":21117,"price":399,"conversion_rate":7.48,"segment":"Growing"},{"product":"Deep Work","category":"Books","revenue":554435,"orders":1591,"views":23013,"price":349,"conversion_rate":6.91,"segment":"Needs Review"},{"product":"Storage Bins","category":"Home & Kitchen","revenue":507639,"orders":732,"views":9954,"price":699,"conversion_rate":7.35,"segment":"Growing"},{"product":"USB Hub","category":"Electronics","revenue":361539,"orders":454,"views":6940,"price":799,"conversion_rate":6.54,"segment":"Needs Review"},{"product":"Eye Cream","category":"Beauty","revenue":249827,"orders":386,"views":4975,"price":649,"conversion_rate":7.76,"segment":"Growing"},{"product":"Jump Rope","category":"Sports","revenue":138818,"orders":463,"views":7110,"price":299,"conversion_rate":6.51,"segment":"Needs Review"}],"categories":[{"category":"Electronics","revenue":49195593,"orders":16028,"buying_rate":7.09,"change_pct":24.6},{"category":"Clothing","revenue":37334367,"orders":15178,"buying_rate":7.21,"change_pct":-17.1},{"category":"Home & Kitchen","revenue":32133063,"orders":10983,"buying_rate":7.23,"change_pct":9.4},{"category":"Beauty","revenue":6735767,"orders":10177,"buying_rate":7.21,"change_pct":-21.1},{"category":"Sports","revenue":5679886,"orders":12000,"buying_rate":7.30,"change_pct":-10.2},{"category":"Books","revenue":4687728,"orders":11310,"buying_rate":7.32,"change_pct":-14.4}],"monthly":[{"month":"Jan","revenue":336.2,"orders":19268},{"month":"Feb","revenue":553.1,"orders":30277},{"month":"Mar","revenue":385.6,"orders":21752},{"month":"Apr (partial)","revenue":82.8,"orders":4379}],"day_of_week":[{"day":"Mon","avg":13.44},{"day":"Tue","avg":13.03},{"day":"Wed","avg":13.06},{"day":"Thu","avg":12.94},{"day":"Fri","avg":12.85},{"day":"Sat","avg":21.96},{"day":"Sun","avg":18.16}],"unusualDays":["2026-02-21","2026-02-22","2026-02-23","2026-03-24","2026-03-25"],"forecast":{"base":[774,735,688,602,562,517,481,393,369,332,311,243,249,180,126],"optimistic":[968,919,860,753,703,646,601,491,461,415,389,304,311,225,158],"pessimistic":[581,551,516,452,422,388,361,295,277,249,233,182,187,135,95]},"health_score":{"total":52,"status":"Needs Attention","components":{"sales_trend":16,"buying_rate":20,"product_variety":12,"unusual_events":4},"explanation":"Your store scored 52 out of 100 — it needs attention. Sales are slowly recovering but the store depends too heavily on a few products and had several unusual days recently."},"alerts":[{"id":"sales_drop","severity":"urgent","title":"Sales fell 16.8% over 2 weeks but are slowly recovering","detail":"Earnings dropped sharply but the last 14 days show a +2.2% recovery. The outage in late March caused most of the damage. Act now to accelerate the recovery.","category":"Sales Trend"},{"id":"outage","severity":"urgent","title":"Website was down Mar 23–25 — ₹13.7L in lost sales","detail":"3 days of near-zero sales. At your normal daily rate, this cost roughly ₹13.7 lakh. Check with your hosting provider so this doesn't happen again.","category":"Outage"},{"id":"weekend_opportunity","severity":"positive","title":"Saturdays earn 71% more than Fridays — you're not using this","detail":"Your Saturday average is ₹22L vs ₹12.9L on Fridays. Yet you're not running any targeted weekend promotions. This is your biggest untapped opportunity.","category":"Opportunity"},{"id":"missed_sales","severity":"warning","title":"73,000 people visited Smart Watch but didn't buy","detail":"Smart Watch had 78,542 visitors but only 5,501 bought (7%). Even a small improvement in listing quality or a minor discount could convert thousands more.","category":"Missed Opportunity"},{"id":"few_products","severity":"warning","title":"72% of income from just 6 products","detail":"Smart Watch, Running Shoes, Air Fryer and 3 others make up most of your earnings. If one has a bad week, your whole store feels it.","products":["Smart Watch","Running Shoes","Air Fryer","Wireless Earbuds","Coffee Maker","Denim Jacket"],"category":"Risk"},{"id":"blender_gap","severity":"warning","title":"Blender: 24,036 visitors — only 6.4% bought","detail":"Below your store average of 7.2%. 22,500 people looked at Blender and left. Better photos, a clearer description, or a ₹200 price cut could fix this.","category":"Conversion Gap"},{"id":"dead_stock","severity":"warning","title":"4 products sell less than 6 items per day","detail":"Jump Rope (5/day), Eye Cream (4/day), USB Hub (5/day) are taking up listing space. At this rate they will never meaningfully contribute to revenue.","products":["Jump Rope","Eye Cream","USB Hub","Storage Bins"],"category":"Dead Stock"}],"quick_wins":[{"title":"Run a 15% discount on Smart Watch this Saturday","why":"Saturdays earn 71% more than Fridays. Smart Watch is your top earner. A weekend deal on your best product is the highest-impact single move you can make right now.","expected":"Estimated ₹2–3L extra this weekend alone","effort":"Low","timing":"This Saturday"},{"title":"Fix the Blender listing — 22,500 people looked but didn't buy","why":"Blender converts at 6.4%, below your store average of 7.2%. Better product photos or a ₹200 price drop could recover thousands of lost sales.","expected":"1% improvement = 240 more orders = ₹5.3L","effort":"Low","timing":"This week"},{"title":"Remove Jump Rope, Eye Cream, USB Hub from main listings","why":"These 3 products sell fewer than 5 items per day combined. They take up valuable listing space that your growing products could use.","expected":"Cleaner store, better average metrics","effort":"Low","timing":"This week"},{"title":"Double your advertising spend on Saturdays and Sundays","why":"You already earn 53% more on weekends without extra effort. Paid ads on your best days will compound your natural weekend advantage.","expected":"Weekend revenue lift of 10–20%","effort":"Medium","timing":"Every weekend"},{"title":"Investigate the Beauty category drop urgently","why":"Beauty fell 21% over 2 weeks, led by Face Serum (-38.8%). Check for a competitor listing, a stock issue, or a listing quality problem.","expected":"Prevent further decline in a growing category","effort":"Medium","timing":"This week"}],"rca":{"narrative":"Overall sales are recovering slightly (+2.2% last 14 days). Electronics grew strongly (+24.6%). Beauty fell 21% and Clothing fell 17%. The 3-day outage in late March caused a sharp temporary crash.","category_impacts":[{"category":"Beauty","change_pct":-21.1},{"category":"Clothing","change_pct":-17.1},{"category":"Books","change_pct":-14.4},{"category":"Sports","change_pct":-10.2},{"category":"Home & Kitchen","change_pct":9.4},{"category":"Electronics","change_pct":24.6}],"product_drops":[{"product":"Face Serum","category":"Beauty","change_pct":-38.8},{"product":"Water Bottle","category":"Sports","change_pct":-30.5},{"product":"Deep Work","category":"Books","change_pct":-29.7},{"product":"Gym Gloves","category":"Sports","change_pct":-28.6},{"product":"Yoga Pants","category":"Clothing","change_pct":-24.9}]}};

// // ─── HELPERS ──────────────────────────────────────────────────────────────────
// const fmt  = n => n>=1e7?`₹${(n/1e7).toFixed(1)}Cr`:n>=1e5?`₹${(n/1e5).toFixed(1)}L`:`₹${Math.round(n).toLocaleString()}`;
// const fmtL = n => `₹${(n/1e5).toFixed(1)}L`;
// const SEV  = { urgent:{bg:"#fef2f2",border:"#fca5a5",title:"#dc2626",dot:"#ef4444",badge:"Urgent"}, warning:{bg:"#fffbeb",border:"#fde68a",title:"#d97706",dot:"#f59e0b",badge:"Review"}, positive:{bg:"#f0fdf4",border:"#bbf7d0",title:"#16a34a",dot:"#22c55e",badge:"Opportunity"} };
// const PRI  = { urgent:"#dc2626", high:"#ea580c", medium:"#ca8a04" };
// const PLAB = { urgent:"Do now", high:"This week", medium:"Soon" };
// const SCFG = { "Top Earner":{color:"#16a34a",bg:"#f0fdf4",border:"#bbf7d0",desc:"Your biggest money-makers"}, "Growing":{color:"#f59e0b",bg:"#fffbeb",border:"#fde68a",desc:"Good potential — invest here"}, "Needs Review":{color:"#ef4444",bg:"#fef2f2",border:"#fca5a5",desc:"Low sales — refresh or remove"} };

// // ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
// const Tile = ({label,value,sub,color="#111827",bg="#fff"}) => (
//   <div style={{background:bg,border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px",flex:1}}>
//     <div style={{fontSize:11,color:"#9ca3af",marginBottom:3}}>{label}</div>
//     <div style={{fontSize:21,fontWeight:700,color}}>{value}</div>
//     {sub&&<div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{sub}</div>}
//   </div>
// );

// const AlertCard = ({alert}) => {
//   const s = SEV[alert.severity]||SEV.warning;
//   return (
//     <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:"13px 15px",marginBottom:9}}>
//       <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
//         <div style={{width:20,height:20,borderRadius:"50%",background:s.dot,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,marginTop:2}}>{alert.severity==="urgent"?"!":alert.severity==="positive"?"★":"~"}</div>
//         <div style={{flex:1}}>
//           <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:3}}>
//             <div style={{fontWeight:600,fontSize:13,color:s.title,lineHeight:1.4}}>{alert.title}</div>
//             <span style={{background:s.dot,color:"#fff",borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:600,flexShrink:0}}>{s.badge}</span>
//           </div>
//           <div style={{fontSize:12,color:"#6b7280",lineHeight:1.55}}>{alert.detail}</div>
//           {alert.products&&<div style={{marginTop:5,display:"flex",flexWrap:"wrap",gap:3}}>{alert.products.slice(0,4).map(p=><span key={p} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:4,padding:"1px 6px",fontSize:10,color:"#374151"}}>{p}</span>)}{alert.products.length>4&&<span style={{fontSize:10,color:"#9ca3af"}}>+{alert.products.length-4} more</span>}</div>}
//           <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>{alert.category}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const QuickWinCard = ({win,index}) => (
//   <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
//     <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
//       <div style={{width:24,height:24,borderRadius:"50%",background:"#6366f1",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>#{index+1}</div>
//       <div style={{flex:1}}>
//         <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:2}}>{win.title}</div>
//         <div style={{display:"flex",gap:6,marginBottom:6}}>
//           <span style={{background:"#f3f4f6",borderRadius:4,padding:"1px 7px",fontSize:10,color:"#374151"}}>⏱ {win.timing}</span>
//           <span style={{background:"#f3f4f6",borderRadius:4,padding:"1px 7px",fontSize:10,color:"#374151"}}>⚡ {win.effort} effort</span>
//         </div>
//       </div>
//     </div>
//     <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6,marginBottom:6}}>{win.why}</div>
//     <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#16a34a",fontWeight:500}}>💰 {win.expected}</div>
//   </div>
// );

// const HealthRing = ({score}) => {
//   const r=50,circ=2*Math.PI*r,offset=circ-(score/100)*circ;
//   const color=score>=75?"#22c55e":score>=50?"#f59e0b":"#ef4444";
//   return (
//     <svg width="120" height="120" viewBox="0 0 120 120">
//       <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10"/>
//       <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{transform:"rotate(-90deg)",transformOrigin:"60px 60px",transition:"stroke-dashoffset 1s ease"}}/>
//       <text x="60" y="54" textAnchor="middle" fontSize="24" fontWeight="700" fill={color}>{score}</text>
//       <text x="60" y="70" textAnchor="middle" fontSize="11" fill="#6b7280">out of 100</text>
//     </svg>
//   );
// };

// // ─── WHAT-IF ──────────────────────────────────────────────────────────────────
// const WhatIfPanel = () => {
//   const [product,setProduct] = useState(DATA.products[0].product);
//   const [priceChg,setPriceChg] = useState(0);
//   const [discount,setDiscount] = useState(0);
//   const r = useMemo(()=>{
//     const p=DATA.products.find(x=>x.product===product); if(!p)return null;
//     const dc=1+(priceChg*-0.8/100),cb=1+(discount*0.05);
//     const np=p.price*(1+priceChg/100)*(1-discount/100),no=p.orders*dc*cb,nr=no*np;
//     return {origRev:p.revenue,origOrders:p.orders,newRevenue:nr,newOrders:no,chgPct:(nr-p.revenue)/p.revenue*100};
//   },[product,priceChg,discount]);
//   const pos=r?.chgPct>=0;
//   return (
//     <div>
//       <div style={{fontWeight:700,fontSize:17,color:"#111827",marginBottom:3}}>Test Before You Try</div>
//       <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Move the sliders and see how your estimated earnings change — before committing to anything real.</div>
//       <div style={{marginBottom:14}}>
//         <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5}}>Which product?</label>
//         <select value={product} onChange={e=>setProduct(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,color:"#111827",background:"#fff"}}>
//           {DATA.products.map(p=><option key={p.product} value={p.product}>{p.product} — ₹{p.price.toLocaleString()}</option>)}
//         </select>
//       </div>
//       <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
//         <div>
//           <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5}}>Adjust price: {priceChg>0?"+":""}{priceChg}%</label>
//           <input type="range" min="-30" max="30" value={priceChg} onChange={e=>setPriceChg(Number(e.target.value))} style={{width:"100%",accentColor:"#6366f1"}}/>
//           <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#9ca3af",marginTop:2}}><span>Cheaper</span><span>More expensive</span></div>
//         </div>
//         <div>
//           <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5}}>Discount: {discount}%</label>
//           <input type="range" min="0" max="40" value={discount} onChange={e=>setDiscount(Number(e.target.value))} style={{width:"100%",accentColor:"#6366f1"}}/>
//           <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#9ca3af",marginTop:2}}><span>None</span><span>40% off</span></div>
//         </div>
//       </div>
//       {r&&<div style={{background:"#f9fafb",borderRadius:12,padding:14}}>
//         <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
//           {[["Current earnings",fmt(r.origRev),"#6b7280"],["Estimated earnings",fmt(r.newRevenue),pos?"#16a34a":"#dc2626"],["Current orders",r.origOrders.toLocaleString(),"#6b7280"],["Estimated orders",Math.round(r.newOrders).toLocaleString(),"#374151"]].map(([l,v,c])=>(
//             <div key={l} style={{background:"#fff",borderRadius:8,padding:"9px 12px",border:"1px solid #e5e7eb"}}>
//               <div style={{fontSize:10,color:"#9ca3af"}}>{l}</div>
//               <div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div>
//             </div>
//           ))}
//         </div>
//         <div style={{background:pos?"#f0fdf4":"#fef2f2",border:`1px solid ${pos?"#bbf7d0":"#fca5a5"}`,borderRadius:8,padding:"10px 14px"}}>
//           <div style={{fontWeight:700,fontSize:15,color:pos?"#16a34a":"#dc2626",marginBottom:3}}>{pos?"▲":"▼"} {Math.abs(r.chgPct).toFixed(1)}% change in earnings</div>
//           <div style={{fontSize:11,color:"#6b7280"}}>{pos?"This change looks good — estimated earnings go up.":"Careful — this could reduce earnings. Try adjusting the sliders."}</div>
//         </div>
//       </div>}
//     </div>
//   );
// };

// // ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
// const HowItWorksPanel = () => {
//   const [active,setActive] = useState("forecast");
//   const unusualSet = new Set(DATA.unusualDays);
//   const chartData = DATA.daily.slice(-40).map(d=>({date:d.date.slice(5),earnings:Math.round(d.revenue/1000),flagged:unusualSet.has(d.date)?Math.round(d.revenue/1000):null}));
//   const fcData = DATA.daily.slice(-20).map((d,i)=>({date:d.date.slice(5),actual:Math.round(d.revenue/1000),base:i<DATA.mlForecast.forecast.length?DATA.mlForecast.forecast[i]:null,optimistic:i<DATA.forecast.optimistic.length?DATA.forecast.optimistic[i]:null,pessimistic:i<DATA.forecast.pessimistic.length?DATA.forecast.pessimistic[i]:null}));
//   return (
//     <div>
//       <div style={{fontWeight:700,fontSize:17,color:"#111827",marginBottom:3}}>How Ecomlytics Thinks</div>
//       <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>A plain-English look at the three ways the system analyses your store.</div>
//       <div style={{display:"flex",gap:7,marginBottom:18}}>
//         {[["forecast","Sales Forecast"],["unusual","Unusual Days"],["groups","Product Groups"]].map(([id,label])=>(
//           <button key={id} onClick={()=>setActive(id)} style={{padding:"6px 14px",borderRadius:7,border:"1px solid",fontSize:12,fontWeight:600,cursor:"pointer",background:active===id?"#6366f1":"#fff",color:active===id?"#fff":"#374151",borderColor:active===id?"#6366f1":"#e5e7eb"}}>{label}</button>
//         ))}
//       </div>

//       {active==="forecast"&&<div>
//         <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:9,padding:"10px 14px",marginBottom:14}}>
//           <div style={{fontWeight:600,fontSize:12,color:"#1d4ed8",marginBottom:3}}>What is this?</div>
//           <div style={{fontSize:12,color:"#1d4ed8",lineHeight:1.6}}>The system studied 90 days of sales to find your patterns — busy days, slow days, weekly rhythms. It then estimates the next 2 weeks. We show 3 scenarios: if things improve, stay the same, or get worse.</div>
//         </div>
//         <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
//           <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:9,padding:12}}><div style={{fontSize:11,color:"#9ca3af",marginBottom:3}}>Method 1 — not used</div><div style={{fontSize:12,fontWeight:600,color:"#111827",marginBottom:3}}>Straight line</div><div style={{fontSize:11,color:"#6b7280",lineHeight:1.4}}>Draws a straight trend line. Fast but misses day-to-day variations.</div></div>
//           <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:12}}><div style={{fontSize:11,color:"#9ca3af",marginBottom:3}}>Method 2 — used ✓</div><div style={{fontSize:12,fontWeight:600,color:"#111827",marginBottom:3}}>Momentum-based</div><div style={{fontSize:11,color:"#6b7280",lineHeight:1.4}}>Learns from recent momentum and weekly patterns. More accurate on our data.</div><div style={{fontSize:11,color:"#16a34a",fontWeight:600,marginTop:4}}>Selected — 4% more accurate</div></div>
//         </div>
//         <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:7}}>Forecast range — best, likely, and worst case (₹ thousands)</div>
//         <ResponsiveContainer width="100%" height={170}>
//           <AreaChart data={fcData}>
//             <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} interval={4}/>
//             <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false}/>
//             <Tooltip formatter={(v,n)=>[`₹${v}K`,n==="actual"?"Actual":n==="base"?"Most likely":n==="optimistic"?"Best case":"Worst case"]}/>
//             <Area type="monotone" dataKey="optimistic" fill="#dcfce7" stroke="#22c55e" strokeWidth={1} strokeDasharray="3 3" fillOpacity={0.4} name="optimistic"/>
//             <Area type="monotone" dataKey="pessimistic" fill="#fef2f2" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" fillOpacity={0.4} name="pessimistic"/>
//             <Line type="monotone" dataKey="actual" stroke="#6366f1" dot={false} strokeWidth={2} name="actual"/>
//             <Line type="monotone" dataKey="base" stroke="#f59e0b" dot={false} strokeWidth={2} strokeDasharray="4 4" name="base"/>
//           </AreaChart>
//         </ResponsiveContainer>
//         <div style={{display:"flex",gap:14,marginTop:6,flexWrap:"wrap"}}>
//           {[["#6366f1","—","Actual"],["#f59e0b","- -","Most likely"],["#22c55e","—","Best case"],["#ef4444","—","Worst case"]].map(([c,d,l])=>(<span key={l} style={{fontSize:11,color:"#6b7280"}}><span style={{color:c,fontWeight:700}}>{d}</span> {l}</span>))}
//         </div>
//       </div>}

//       {active==="unusual"&&<div>
//         <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:9,padding:"10px 14px",marginBottom:14}}>
//           <div style={{fontWeight:600,fontSize:12,color:"#d97706",marginBottom:3}}>What is this?</div>
//           <div style={{fontSize:12,color:"#92400e",lineHeight:1.6}}>Every day the system checks if your earnings look normal. If a day has a sudden spike or crash, it flags it. Two independent checks run every day — if both flag the same day, it's highest confidence.</div>
//         </div>
//         <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
//           <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:9,padding:12}}><div style={{fontSize:12,color:"#6b7280",marginBottom:3}}>Smart detection</div><div style={{fontSize:20,fontWeight:700,color:"#111827"}}>5 <span style={{fontSize:11,fontWeight:400,color:"#6b7280"}}>unusual days</span></div><div style={{fontSize:11,color:"#6b7280",marginTop:3,lineHeight:1.4}}>Checks how "out of place" each day is vs the whole pattern</div></div>
//           <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:9,padding:12}}><div style={{fontSize:12,color:"#6b7280",marginBottom:3}}>Numbers check</div><div style={{fontSize:20,fontWeight:700,color:"#111827"}}>3 <span style={{fontSize:11,fontWeight:400,color:"#6b7280"}}>unusual days</span></div><div style={{fontSize:11,color:"#6b7280",marginTop:3,lineHeight:1.4}}>Flags days far outside your normal earnings range</div></div>
//         </div>
//         <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:7,padding:"7px 12px",marginBottom:12,fontSize:11,color:"#7f1d1d"}}>Both agreed on Feb 21–23 (flash sale). Only smart check caught Mar 24–25 (gradual outage drop — not extreme enough for numbers check).</div>
//         <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:7}}>Daily earnings — orange dots = flagged days</div>
//         <ResponsiveContainer width="100%" height={170}>
//           <LineChart data={chartData}>
//             <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} interval={4}/>
//             <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false}/>
//             <Tooltip formatter={v=>`₹${v}K`}/>
//             <Line type="monotone" dataKey="earnings" stroke="#6366f1" dot={false} strokeWidth={2} name="Earnings"/>
//             <Line type="monotone" dataKey="flagged" stroke="#f59e0b" dot={{r:6,fill:"#f59e0b"}} strokeWidth={0} name="Flagged"/>
//           </LineChart>
//         </ResponsiveContainer>
//         <div style={{marginTop:12}}>
//           {[{d:"Feb 21",e:"₹88.5L",w:"Huge spike",y:"Flash sale — both agreed",c:"#16a34a"},{d:"Feb 22",e:"₹44.5L",w:"Spike",y:"Flash sale — both agreed",c:"#16a34a"},{d:"Feb 23",e:"₹40.1L",w:"Spike",y:"Flash sale — both agreed",c:"#16a34a"},{d:"Mar 24",e:"₹1.6L",w:"Sharp drop",y:"Website outage — smart check only",c:"#ef4444"},{d:"Mar 25",e:"₹1.2L",w:"Sharp drop",y:"Website outage — smart check only",c:"#ef4444"}].map(a=>(
//             <div key={a.d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f3f4f6",fontSize:12}}>
//               <span style={{color:"#374151",fontWeight:500,width:50}}>{a.d}</span>
//               <span style={{color:"#6b7280",width:55}}>{a.e}</span>
//               <span style={{fontWeight:600,color:a.c,width:85}}>{a.w}</span>
//               <span style={{color:"#6b7280",flex:1,textAlign:"right"}}>{a.y}</span>
//             </div>
//           ))}
//         </div>
//       </div>}

//       {active==="groups"&&<div>
//         <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:9,padding:"10px 14px",marginBottom:14}}>
//           <div style={{fontWeight:600,fontSize:12,color:"#1d4ed8",marginBottom:3}}>What is this?</div>
//           <div style={{fontSize:12,color:"#1d4ed8",lineHeight:1.6}}>Instead of you checking 30 products one by one, the system automatically sorted them into 3 groups based on earnings and buying rate. We tested 2–6 group sizes and found 4 worked best, then simplified to 3 for clarity.</div>
//         </div>
//         {["Top Earner","Growing","Needs Review"].map(seg=>{
//           const prods=DATA.products.filter(p=>p.segment===seg);
//           const cfg=SCFG[seg];
//           return (<div key={seg} style={{background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:11,padding:13,marginBottom:9}}>
//             <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
//               <span style={{width:9,height:9,borderRadius:"50%",background:cfg.color,flexShrink:0}}/>
//               <span style={{fontWeight:600,fontSize:13,color:"#111827"}}>{seg}</span>
//               <span style={{fontSize:11,color:"#6b7280"}}>— {cfg.desc}</span>
//               <span style={{marginLeft:"auto",fontSize:10,color:"#9ca3af"}}>{prods.length} products</span>
//             </div>
//             <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
//               {prods.map(p=><span key={p.product} style={{background:"#fff",border:`1px solid ${cfg.border}`,borderRadius:4,padding:"2px 7px",fontSize:11,color:"#374151"}}>{p.product}</span>)}
//             </div>
//           </div>);
//         })}
//       </div>}
//     </div>
//   );
// };

// // ─── ASSISTANT ────────────────────────────────────────────────────────────────
// const Assistant = () => {
//   const [input,setInput] = useState("");
//   const [messages,setMessages] = useState([{role:"bot",text:"Hi! Ask me anything about your store. I'll give you a plain-English answer with clear next steps."}]);
//   const [loading,setLoading] = useState(false);
//   const endRef = useRef(null);
//   useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[messages]);
//   const ANSWERS = {
//     drop:{s:"Sales fell 16.8% but are slowly recovering (+2.2% last 14 days). The biggest cause: the website outage on Mar 23–25 wiped out ₹13.7L. Beauty also fell 21% (Face Serum down 38.8%) and Clothing fell 17%. The good news: Electronics grew 24.6%.",r:["Run a 15% discount on Smart Watch this Saturday — highest impact move","Check with your hosting provider about the March outage to prevent recurrence"]},
//     products:{s:"Your 4 top earners: Smart Watch (₹2.7Cr), Running Shoes (₹2.3Cr), Air Fryer (₹1.9Cr), Wireless Earbuds (₹1.4Cr). Growing products with strong potential: Coffee Maker, Face Serum, Summer Dress. Weakest: Jump Rope (₹1.4L), Eye Cream (₹2.5L), USB Hub (₹3.6L).",r:["Advertise Smart Watch and Running Shoes more — they already sell well","Consider removing Jump Rope and USB Hub — they earn less than ₹500/day"]},
//     risk:{s:"Score 52/100 — Needs Attention. Three risks: (1) 72% income from 6 products, (2) 5 unusual days including a 3-day outage, (3) Beauty category falling fast. The biggest single risk: if Smart Watch has an issue, you lose ₹2.7Cr of your top earner.",r:["Start adding 2–3 new products to reduce dependence on top earners","Get a backup hosting plan so outages don't wipe out 3 days of sales"]},
//     buy:{s:"Your store average is 7.2% — meaning 7 out of every 100 visitors buy. That's actually good (industry average is 2–3%). But Blender (6.4%), Denim Jacket (6.96%), Foam Roller (6.7%) are below your own average. Blender is the biggest opportunity — 24,036 visitors but only 6.4% bought.",r:["Improve Blender listing — better photos, clearer description, or ₹200 price drop","Test a 10% discount on Denim Jacket for 7 days and see if buying rate improves"]},
//     weekend:{s:"Saturdays average ₹22L and Sundays ₹18.2L. Weekdays average ₹13L. You're earning 71% more on Saturdays without any extra effort. This is your biggest untapped opportunity — you're not running any targeted weekend promotions.",r:["Schedule your next promotion to start on a Saturday","Increase ad spend on Fridays and Saturdays — these are your highest-conversion days"]},
//     default:{s:"Your store scored 52/100 — it needs attention. Key issues: sales recovering slowly after a March outage, Beauty and Clothing categories dropping, and most income concentrated in 6 products. Best single move: run a discount on Smart Watch this Saturday.",r:["Run a 15% discount on Smart Watch this Saturday","Improve the Blender listing — 22,500 people visited but didn't buy"]}
//   };
//   const send = preset=>{
//     const q=preset||input.trim(); if(!q)return;
//     setInput(""); setMessages(m=>[...m,{role:"user",text:q}]); setLoading(true);
//     setTimeout(()=>{
//       const l=q.toLowerCase();
//       let ans=ANSWERS.default;
//       if(l.includes("drop")||l.includes("fall")||l.includes("why")||l.includes("declin"))ans=ANSWERS.drop;
//       else if(l.includes("product")||l.includes("best")||l.includes("sell")||l.includes("top")||l.includes("weak"))ans=ANSWERS.products;
//       else if(l.includes("risk")||l.includes("safe")||l.includes("health")||l.includes("score"))ans=ANSWERS.risk;
//       else if(l.includes("buy")||l.includes("visitor")||l.includes("traffic")||l.includes("convert"))ans=ANSWERS.buy;
//       else if(l.includes("weekend")||l.includes("saturday")||l.includes("best day")||l.includes("when"))ans=ANSWERS.weekend;
//       setMessages(m=>[...m,{role:"bot",data:ans}]); setLoading(false);
//     },700);
//   };
//   const SUGGS=["Why are my sales dropping?","Which products should I focus on?","Is my store at risk?","When is the best day to run a sale?"];
//   return (
//     <div style={{display:"flex",flexDirection:"column"}}>
//       <div style={{fontWeight:700,fontSize:17,color:"#111827",marginBottom:3}}>Store Assistant</div>
//       <div style={{fontSize:12,color:"#6b7280",marginBottom:12}}>Ask anything in plain English — get a specific answer with clear next steps.</div>
//       <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
//         {SUGGS.map(s=><button key={s} onClick={()=>send(s)} style={{background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:16,padding:"4px 11px",fontSize:11,color:"#374151",cursor:"pointer"}}>{s}</button>)}
//       </div>
//       <div style={{overflowY:"auto",marginBottom:10,minHeight:200,maxHeight:340}}>
//         {messages.map((m,i)=>(
//           <div key={i} style={{marginBottom:10}}>
//             {m.role==="user"
//               ?<div style={{display:"flex",justifyContent:"flex-end"}}><div style={{background:"#6366f1",color:"#fff",borderRadius:"11px 11px 2px 11px",padding:"7px 13px",fontSize:13,maxWidth:"80%"}}>{m.text}</div></div>
//               :m.data
//                 ?<div style={{background:"#f9fafb",borderRadius:11,padding:13,border:"1px solid #e5e7eb"}}><div style={{fontSize:13,color:"#111827",lineHeight:1.6,marginBottom:9}}>{m.data.s}</div>{m.data.r.map((r,j)=><div key={j} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,padding:"7px 11px",marginBottom:5,fontSize:12,color:"#374151"}}>→ {r}</div>)}</div>
//                 :<div style={{background:"#f3f4f6",borderRadius:"11px 11px 11px 2px",padding:"7px 13px",fontSize:13,color:"#374151",maxWidth:"85%"}}>{m.text}</div>
//             }
//           </div>
//         ))}
//         {loading&&<div style={{fontSize:12,color:"#9ca3af",padding:"7px 13px"}}>Looking at your store data…</div>}
//         <div ref={endRef}/>
//       </div>
//       <div style={{display:"flex",gap:7}}>
//         <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type your question here..." style={{flex:1,padding:"9px 13px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,color:"#111827",outline:"none"}}/>
//         <button onClick={()=>send()} style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:8,padding:"9px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Ask</button>
//       </div>
//     </div>
//   );
// };

// // ─── MAIN APP ─────────────────────────────────────────────────────────────────
// export default function Ecomlytics() {
//   const [tab,setTab] = useState("overview");
//   const hs = DATA.health_score;
//   const totalRev   = DATA.daily.reduce((a,d)=>a+d.revenue,0);
//   const recentRev  = DATA.daily.slice(-7).reduce((a,d)=>a+d.revenue,0);
//   const prevRev    = DATA.daily.slice(-14,-7).reduce((a,d)=>a+d.revenue,0);
//   const weekChg    = ((recentRev-prevRev)/prevRev*100).toFixed(1);
//   const avgBuy     = (DATA.daily.slice(-14).reduce((a,d)=>a+(d.orders/d.views*100),0)/14).toFixed(1);
//   const unusualSet = new Set(DATA.unusualDays);
//   const chartData  = DATA.daily.map(d=>({date:d.date.slice(5),earnings:Math.round(d.revenue/1000)}));
//   const lastDate   = new Date(DATA.daily[DATA.daily.length-1].date);
//   const fcChart    = DATA.mlForecast.forecast.slice(0,14).map((v,i)=>{const d=new Date(lastDate);d.setDate(d.getDate()+i+1);return{date:`${d.getMonth()+1}/${d.getDate()}`,predicted:v};});

//   const TABS=[{id:"overview",label:"Overview"},{id:"alerts",label:"Alerts"},{id:"quickwins",label:"Quick Wins"},{id:"whatif",label:"What-If"},{id:"howitworks",label:"How It Works"},{id:"assistant",label:"Assistant"}];

//   return (
//     <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:"#f8f9fb",minHeight:"100vh",color:"#111827"}}>
//       <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,flexWrap:"wrap",gap:8}}>
//         <div style={{display:"flex",alignItems:"center",gap:9}}>
//           <div style={{width:30,height:30,background:"#6366f1",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13}}>E</div>
//           <div><div style={{fontWeight:800,fontSize:15,color:"#111827"}}>Ecomlytics</div><div style={{fontSize:10,color:"#9ca3af",marginTop:-1}}>Your Smart Store Advisor</div></div>
//         </div>
//         <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
//           {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"5px 13px",borderRadius:6,border:"1px solid",fontSize:12,fontWeight:500,cursor:"pointer",background:tab===t.id?"#6366f1":"transparent",color:tab===t.id?"#fff":"#6b7280",borderColor:tab===t.id?"#6366f1":"transparent"}}>{t.label}</button>)}
//         </div>
//         <div style={{background:"#fef9c3",border:"1px solid #fde68a",borderRadius:7,padding:"4px 12px",fontSize:11,color:"#92400e",fontWeight:600}}>⚠ Health score: {hs.total}/100</div>
//       </div>

//       <div style={{padding:"20px",maxWidth:1100,margin:"0 auto"}}>

//         {/* ── OVERVIEW ── */}
//         {tab==="overview"&&<div>
//           <div style={{marginBottom:18}}><div style={{fontSize:22,fontWeight:800,color:"#111827",marginBottom:3}}>Your Store at a Glance</div><div style={{fontSize:13,color:"#6b7280"}}>90 days of data — no jargon, just what matters.</div></div>
//           <div style={{display:"flex",gap:10,marginBottom:16}}>
//             <Tile label="Total earnings (90 days)" value={fmt(totalRev)} sub="30 products · 6 categories"/>
//             <Tile label="Last 7 days" value={fmt(recentRev)} sub={`${weekChg>0?"+":""}${weekChg}% vs week before`} color={weekChg>=0?"#16a34a":"#dc2626"}/>
//             <Tile label="Buying rate" value={`${avgBuy}%`} sub="Out of 100 visitors, this many buy"/>
//             <Tile label="Best day" value="Saturday" sub="Earns 71% more than Fridays" color="#6366f1"/>
//           </div>

//           <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:14,marginBottom:16}}>
//             <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:18,display:"flex",gap:16,alignItems:"center"}}>
//               <HealthRing score={hs.total}/>
//               <div>
//                 <div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:5}}>Store Health Score</div>
//                 <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6,maxWidth:260,marginBottom:9}}>{hs.explanation}</div>
//                 <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
//                   {[["Sales trend",hs.components.sales_trend],["Buying rate",hs.components.buying_rate],["Product variety",hs.components.product_variety],["Unusual events",hs.components.unusual_events]].map(([l,v])=>(
//                     <div key={l} style={{background:"#f3f4f6",borderRadius:6,padding:"3px 8px",textAlign:"center"}}>
//                       <div style={{fontSize:12,fontWeight:700,color:v>=20?"#16a34a":v>=12?"#f59e0b":"#dc2626"}}>{v}/25</div>
//                       <div style={{fontSize:10,color:"#9ca3af"}}>{l}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:14,padding:18}}>
//               <div style={{fontWeight:700,fontSize:14,color:"#dc2626",marginBottom:6}}>⚠ What happens if you do nothing?</div>
//               <div style={{fontSize:26,fontWeight:800,color:"#dc2626",marginBottom:7}}>−33.7% estimated next month</div>
//               <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.6,marginBottom:10}}>The current downward trend suggests you could lose roughly a third of income next month. But this is based on the trend — if you act now (see Quick Wins), this number improves significantly.</div>
//               <div style={{background:"#fff5f5",borderRadius:7,padding:"7px 11px",fontSize:12,color:"#dc2626",fontWeight:500}}>Best single move: run a 15% discount on Beauty Products this Saturday — see Quick Wins tab</div>
//             </div>
//           </div>

//           {/* Monthly trend — NEW */}
//           <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:18,marginBottom:14}}>
//             <div style={{fontWeight:600,fontSize:14,color:"#111827",marginBottom:3}}>Month-by-month earnings</div>
//             <div style={{fontSize:11,color:"#9ca3af",marginBottom:12}}>Feb was your best month (flash sale). March dropped after the website outage. April is partial (only 7 days recorded).</div>
//             <div style={{display:"flex",gap:10,marginBottom:10}}>
//               {DATA.monthly.map((m,i)=>{
//                 const prev=i>0?DATA.monthly[i-1].revenue:null;
//                 const chg=prev?((m.revenue-prev)/prev*100).toFixed(0):null;
//                 const isPartial=m.month.includes("partial");
//                 return (
//                   <div key={m.month} style={{flex:1,background:isPartial?"#f9fafb":"#f3f4f6",border:`1px solid ${isPartial?"#e5e7eb":"#d1d5db"}`,borderRadius:10,padding:"10px 12px",opacity:isPartial?0.7:1}}>
//                     <div style={{fontSize:11,color:"#9ca3af",marginBottom:2}}>{m.month}</div>
//                     <div style={{fontSize:18,fontWeight:700,color:"#111827"}}>₹{m.revenue}L</div>
//                     <div style={{fontSize:11,color:"#6b7280"}}>{m.orders.toLocaleString()} orders</div>
//                     {chg&&<div style={{fontSize:11,fontWeight:600,color:Number(chg)>=0?"#16a34a":"#dc2626",marginTop:3}}>{Number(chg)>=0?"+":""}{chg}% vs {DATA.monthly[i-1].month}</div>}
//                     {isPartial&&<div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>7 days only</div>}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Day of week — NEW */}
//           <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:18,marginBottom:14}}>
//             <div style={{fontWeight:600,fontSize:14,color:"#000000",marginBottom:3}}>Which day of the week earns the most?</div>
//             <div style={{fontSize:11,color:"#9ca3af",marginBottom:12}}>Average daily earnings by day — Saturdays are significantly stronger. Time your promotions here.</div>
//             <ResponsiveContainer width="100%" height={130}>
//               <BarChart data={DATA.day_of_week}>
//                 <XAxis dataKey="day" tick={{fontSize:11}} tickLine={false}/>
//                 <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false}/>
//                 <Tooltip formatter={v=>`₹${v}L avg`}/>
//                 <Bar dataKey="avg" radius={[4,4,0,0]}>
//                   {DATA.day_of_week.map((d,i)=><rect key={i} fill={d.day==="Sat"||d.day==="Sun"?"#6366f1":"#c7d2fe"}/>)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//             <div style={{marginTop:8,background:"#eff6ff",border:"1px solid #c7d2fe",borderRadius:7,padding:"7px 12px",fontSize:12,color:"#4338ca"}}>
//               💡 <strong>Insight:</strong> Saturday earns ₹22L on average vs ₹12.9L on Friday — that's 71% more. Schedule all promotions to start on Saturdays.
//             </div>
//           </div>

//           {/* Earnings chart */}
//           <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:18,marginBottom:14}}>
//             <div style={{fontWeight:600,fontSize:14,color:"#111827",marginBottom:2}}>Daily earnings + 2-week forecast</div>
//             <div style={{fontSize:11,color:"#9ca3af",marginBottom:10}}>₹ thousands · Orange dots = unusual days · Dashed = forecast</div>
//             <ResponsiveContainer width="100%" height={190}>
//               <LineChart data={[...chartData.slice(-50),...fcChart]} margin={{right:8}}>
//                 <XAxis dataKey="date" tick={{fontSize:10}} tickLine={false} interval={6}/>
//                 <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false}/>
//                 <Tooltip formatter={(v,n)=>[`₹${v}K`,n==="earnings"?"Actual":"Forecast"]}/>
//                 <Line type="monotone" dataKey="earnings" stroke="#6366f1" dot={(p)=>{const{cx,cy,payload}=p;const full=DATA.daily.find(d=>d.date.slice(5)===payload.date);return unusualSet.has(full?.date)?<circle key={cx} cx={cx} cy={cy} r={5} fill="#f59e0b" stroke="#fff" strokeWidth={1}/>:<circle key={cx} cx={cx} cy={cy} r={0}/>;}} strokeWidth={2} name="earnings"/>
//                 <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" dot={false} strokeWidth={2} strokeDasharray="5 5" name="predicted"/>
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Category health — NEW */}
//           <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:18}}>
//             <div style={{fontWeight:600,fontSize:14,color:"#111827",marginBottom:10}}>Category health (last 2 weeks vs 2 weeks before)</div>
//             <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
//               {DATA.categories.map(c=>(
//                 <div key={c.category} style={{background:c.change_pct>5?"#f0fdf4":c.change_pct<-5?"#fef2f2":"#f9fafb",border:`1px solid ${c.change_pct>5?"#bbf7d0":c.change_pct<-5?"#fca5a5":"#e5e7eb"}`,borderRadius:9,padding:"10px 12px"}}>
//                   <div style={{fontSize:12,fontWeight:600,color:"#111827",marginBottom:2}}>{c.category}</div>
//                   <div style={{fontSize:18,fontWeight:700,color:c.change_pct>5?"#16a34a":c.change_pct<-5?"#dc2626":"#f59e0b"}}>{c.change_pct>0?"+":""}{c.change_pct}%</div>
//                   <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>₹{(c.revenue/1e5).toFixed(0)}L total · {c.buying_rate}% buy rate</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>}

//         {/* ── ALERTS ── */}
//         {tab==="alerts"&&<div>
//           <div style={{marginBottom:18}}><div style={{fontSize:22,fontWeight:800,color:"#111827",marginBottom:3}}>What's Happening?</div><div style={{fontSize:13,color:"#6b7280"}}>Everything important your store is signalling right now — sorted by urgency.</div></div>
//           <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
//             <div>
//               <div style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>Store alerts ({DATA.alerts.length})</div>
//               {DATA.alerts.map(a=><AlertCard key={a.id} alert={a}/>)}
//             </div>
//             <div>
//               <div style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>Why is this happening?</div>
//               <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:11,padding:14,marginBottom:12}}>
//                 <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:5}}>The short story</div>
//                 <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>{DATA.rca.narrative}</div>
//               </div>
//               <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:11,padding:14,marginBottom:12}}>
//                 <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:9}}>Category breakdown (last 2 weeks vs 2 weeks before)</div>
//                 {DATA.rca.category_impacts.map(c=>(
//                   <div key={c.category} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f3f4f6"}}>
//                     <span style={{fontSize:12,color:"#374151"}}>{c.category}</span>
//                     <div style={{display:"flex",alignItems:"center",gap:7}}>
//                       <div style={{width:65,height:5,background:"#f3f4f6",borderRadius:3,overflow:"hidden"}}><div style={{width:`${Math.min(100,Math.abs(c.change_pct)*2.5)}%`,height:"100%",background:c.change_pct>=0?"#22c55e":"#ef4444",borderRadius:3}}/></div>
//                       <span style={{fontSize:12,fontWeight:600,color:c.change_pct>=0?"#16a34a":"#dc2626",width:48,textAlign:"right"}}>{c.change_pct>0?"+":""}{c.change_pct}%</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:11,padding:14}}>
//                 <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:9}}>Which products dropped most?</div>
//                 {DATA.rca.product_drops.map(p=>(
//                   <div key={p.product} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f3f4f6"}}>
//                     <div><span style={{fontSize:12,color:"#374151"}}>{p.product}</span><span style={{fontSize:10,color:"#9ca3af",marginLeft:5}}>{p.category}</span></div>
//                     <span style={{fontSize:12,fontWeight:600,color:"#dc2626"}}>{p.change_pct}%</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>}

//         {/* ── QUICK WINS ── */}
//         {tab==="quickwins"&&<div>
//           <div style={{marginBottom:18}}><div style={{fontSize:22,fontWeight:800,color:"#111827",marginBottom:3}}>Your Quick Wins</div><div style={{fontSize:13,color:"#6b7280"}}>5 specific actions you can take right now — each with a clear expected result.</div></div>
//           <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
//             <div>
//               {DATA.quick_wins.map((w,i)=><QuickWinCard key={i} win={w} index={i}/>)}
//             </div>
//             <div>
//               <div style={{fontWeight:600,fontSize:13,color:"#374151",marginBottom:10}}>How your products are grouped</div>
//               <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:11,padding:14,marginBottom:14}}>
//                 {["Top Earner","Growing","Needs Review"].map(seg=>{
//                   const prods=DATA.products.filter(p=>p.segment===seg);
//                   const cfg=SCFG[seg];
//                   return (<div key={seg} style={{marginBottom:13}}>
//                     <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
//                       <span style={{width:9,height:9,borderRadius:"50%",background:cfg.color,flexShrink:0}}/>
//                       <span style={{fontWeight:600,fontSize:12,color:"#111827"}}>{seg}</span>
//                       <span style={{fontSize:11,color:"#6b7280"}}>— {cfg.desc}</span>
//                     </div>
//                     <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{prods.map(p=><span key={p.product} style={{background:`${cfg.color}18`,border:`1px solid ${cfg.color}44`,borderRadius:4,padding:"2px 7px",fontSize:10,color:"#374151"}}>{p.product}</span>)}</div>
//                   </div>);
//                 })}
//               </div>
//               <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:11,padding:14}}>
//                 <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:10}}>Your 5-step game plan</div>
//                 <div style={{fontSize:12,color:"#6b7280",lineHeight:2.2}}>
//                   <div>🎯 Run a Saturday promotion on Smart Watch this week</div>
//                   <div>🔧 Fix the Blender listing — 22,500 missed buyers</div>
//                   <div>🗑 Remove Jump Rope, Eye Cream, USB Hub from main listings</div>
//                   <div>📢 Double ad spend on weekends (Sat–Sun)</div>
//                   <div>🔍 Investigate Beauty category drop before it gets worse</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>}

//         {/* ── WHAT-IF ── */}
//         {tab==="whatif"&&<div>
//           <div style={{marginBottom:18}}><div style={{fontSize:22,fontWeight:800,color:"#111827",marginBottom:3}}>Test Before You Try</div><div style={{fontSize:13,color:"#6b7280"}}>See how a price change or discount would affect your earnings — before doing it for real.</div></div>
//           <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:22,maxWidth:600}}><WhatIfPanel/></div>
//         </div>}

//         {/* ── HOW IT WORKS ── */}
//         {tab==="howitworks"&&<div>
//           <div style={{marginBottom:18}}><div style={{fontSize:22,fontWeight:800,color:"#111827",marginBottom:3}}>How Ecomlytics Analyses Your Store</div><div style={{fontSize:13,color:"#6b7280"}}>A plain-English explanation — no technical knowledge needed.</div></div>
//           <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:22}}><HowItWorksPanel/></div>
//         </div>}

//         {/* ── ASSISTANT ── */}
//         {tab==="assistant"&&<div>
//           <div style={{marginBottom:18}}><div style={{fontSize:22,fontWeight:800,color:"#111827",marginBottom:3}}>Ask Your Store Anything</div><div style={{fontSize:13,color:"#6b7280"}}>Type any question and get a plain-English answer with specific next steps.</div></div>
//           <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:22,maxWidth:700}}><Assistant/></div>
//         </div>}

//       </div>
//     </div>
//   );
// }

import Ecomlytics from "./ecomlytics";

function App() {
  return <Ecomlytics />;
}

export default App;
