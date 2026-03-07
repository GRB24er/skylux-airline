$f = "C:\Users\Archi\skylux-airways\src\scripts\populate.ts"
$c = Get-Content $f -Raw
if ($c -match "SXM") { Write-Host "[SKIP] Michigan routes already added" -ForegroundColor Yellow; exit }
$michigan = @(
''
'    // MICHIGAN DOMESTIC & CONNECTIONS'
'    ["JFK","DTW",A321C,"commercial",120,509,0,128,310,780,0,7,"SXM 01",[0]],'
'    ["DTW","JFK",A321C,"commercial",130,509,0,128,310,780,0,16,"SXM 02",[0]],'
'    ["ORD","DTW",A321,"commercial",75,235,0,89,220,540,0,8,"SXM 03",[0]],'
'    ["DTW","ORD",A321,"commercial",80,235,0,89,220,540,0,17,"SXM 04",[0]],'
'    ["DTW","MQT",A321B,"commercial",80,370,0,98,240,580,0,9,"SXM 05",[1,3,5,7]],'
'    ["MQT","DTW",A321B,"commercial",85,370,0,98,240,580,0,15,"SXM 06",[1,3,5,7]],'
'    ["DTW","GRR",A321,"commercial",55,120,0,78,190,460,0,8,"SXM 07",[0]],'
'    ["GRR","DTW",A321,"commercial",55,120,0,78,190,460,0,17,"SXM 08",[0]],'
'    ["DTW","TVC",A321B,"commercial",65,210,0,88,215,520,0,10,"SXM 09",[1,3,5,7]],'
'    ["TVC","DTW",A321B,"commercial",65,210,0,88,215,520,0,16,"SXM 10",[1,3,5,7]],'
'    ["DTW","FNT",A321,"commercial",40,60,0,68,165,390,0,9,"SXM 11",[1,3,5]],'
'    ["FNT","DTW",A321,"commercial",40,60,0,68,165,390,0,15,"SXM 12",[1,3,5]],'
'    ["DTW","LAN",A321,"commercial",45,80,0,72,175,420,0,10,"SXM 13",[1,3,5]],'
'    ["LAN","DTW",A321,"commercial",45,80,0,72,175,420,0,16,"SXM 14",[1,3,5]],'
'    ["DTW","AZO",A321,"commercial",50,120,0,78,190,460,0,11,"SXM 15",[2,4,6]],'
'    ["AZO","DTW",A321,"commercial",50,120,0,78,190,460,0,17,"SXM 16",[2,4,6]],'
'    ["DTW","MBS",A321B,"commercial",45,90,0,72,175,420,0,9,"SXM 17",[2,4,6]],'
'    ["MBS","DTW",A321B,"commercial",45,90,0,72,175,420,0,15,"SXM 18",[2,4,6]],'
'    ["DTW","CIU",A321B,"commercial",70,280,0,92,225,550,0,10,"SXM 19",[2,5]],'
'    ["CIU","DTW",A321B,"commercial",70,280,0,92,225,550,0,16,"SXM 20",[2,5]],'
'    ["DTW","PLN",A321B,"commercial",60,230,0,88,215,520,0,11,"SXM 21",[1,4]],'
'    ["PLN","DTW",A321B,"commercial",60,230,0,88,215,520,0,16,"SXM 22",[1,4]],'
'    ["DTW","ESC",A321B,"commercial",70,310,0,92,225,550,0,10,"SXM 23",[3,6]],'
'    ["ESC","DTW",A321B,"commercial",70,310,0,92,225,550,0,15,"SXM 24",[3,6]],'
'    ["DTW","APN",A321B,"commercial",60,200,0,85,210,510,0,9,"SXM 25",[2,5]],'
'    ["APN","DTW",A321B,"commercial",60,200,0,85,210,510,0,15,"SXM 26",[2,5]],'
'    ["DTW","IMT",A321B,"commercial",75,350,0,95,235,570,0,10,"SXM 27",[3,6]],'
'    ["IMT","DTW",A321B,"commercial",75,350,0,95,235,570,0,15,"SXM 28",[3,6]],'
'    ["DTW","CMX",A321B,"commercial",85,400,0,98,240,580,0,9,"SXM 29",[1,4]],'
'    ["CMX","DTW",A321B,"commercial",85,400,0,98,240,580,0,15,"SXM 30",[1,4]],'
'    ["ORD","GRR",A321,"commercial",55,150,0,82,200,480,0,9,"SXM 31",[1,3,5,7]],'
'    ["GRR","ORD",A321,"commercial",55,150,0,82,200,480,0,17,"SXM 32",[1,3,5,7]],'
'    ["ORD","MQT",A321,"commercial",80,340,0,95,235,570,0,11,"SXM 33",[2,5]],'
'    ["MQT","ORD",A321,"commercial",85,340,0,95,235,570,0,16,"SXM 34",[2,5]],'
'    ["ATL","DTW",A321C,"commercial",110,596,0,118,290,710,0,8,"SXM 35",[0]],'
'    ["DTW","ATL",A321C,"commercial",115,596,0,118,290,710,0,16,"SXM 36",[0]],'
'    ["DTW","LAX",B789B,"commercial",275,1983,0,245,600,1480,3200,8,"SXM 37",[1,3,5,7]],'
'    ["LAX","DTW",B789B,"commercial",265,1983,0,245,600,1480,3200,11,"SXM 38",[1,3,5,7]],'
'    ["DTW","MIA",A321C,"commercial",175,1152,0,168,410,1010,0,9,"SXM 39",[0]],'
'    ["MIA","DTW",A321C,"commercial",185,1152,0,168,410,1010,0,16,"SXM 40",[0]],'
'    ["DTW","DFW",A321C,"commercial",165,999,0,155,380,940,0,10,"SXM 41",[1,3,5]],'
'    ["DFW","DTW",A321C,"commercial",155,999,0,155,380,940,0,15,"SXM 42",[1,3,5]],'
'    ["LHR","DTW",B789,"commercial",510,3752,0,490,1210,3100,6200,10,"SXM 43",[1,4,6]],'
'    ["DTW","LHR",B789,"commercial",470,3752,0,490,1210,3100,6200,19,"SXM 44",[2,5,7]],'
'    // Private jet to Sawyer (9072ft runway)'
'    ["TEB","MQT",G700,"private-jet",150,700,0,0,0,0,28500,10,"SXP 20",[2,5]],'
'    ["MQT","TEB",G700,"private-jet",160,700,0,0,0,0,28500,14,"SXP 21",[3,6]],'
'    ["VNY","MQT",G700,"private-jet",260,1800,0,0,0,0,52400,9,"SXP 22",[4]],'
'    ["MQT","VNY",G700,"private-jet",270,1800,0,0,0,0,52400,10,"SXP 23",[5]],'
)
$block = ($michigan -join "`n")
$target = '["LHR","NRT",G700,"private-jet",690,5246,0,0,0,0,143800,20,"SXP 16",[4]],'
$idx = $c.IndexOf($target)
if ($idx -ge 0) {
    $pos = $idx + $target.Length
    $c = $c.Insert($pos, "`n" + $block)
    [System.IO.File]::WriteAllText($f, $c)
    Write-Host "[OK] 50 Michigan routes added to populate.ts" -ForegroundColor Green
    Write-Host "Now run: npx tsx src/scripts/populate.ts" -ForegroundColor Cyan
} else {
    Write-Host "[WARN] Could not find insertion point" -ForegroundColor Red
}
