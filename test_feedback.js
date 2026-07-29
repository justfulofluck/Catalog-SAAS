const el = { width: 200, height: 200 };
let groupHeight = 200;

for (let i = 0; i < 5; i++) {
  console.log(`Step ${i}: el.height = ${el.height}`);
  
  // Fabric creates a group.
  const targetH = el.height * 0.6;
  const text1Top = targetH + 10;
  const text1H = 50; // say it wraps
  const text1Bottom = text1Top + text1H;
  
  const text2Top = text1Top + 27;
  const text2H = 15;
  const text2Bottom = text2Top + text2H;
  
  const computedGroupHeight = Math.max(el.height, text1Bottom, text2Bottom);
  
  console.log(`  computed group height = ${computedGroupHeight}`);
  
  // object:modified fires
  el.height = computedGroupHeight;
}
