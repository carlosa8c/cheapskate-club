import type {Member} from './member';

export function ShareCard({
  member,
  champion,
  square,
  date,
  theme = 'dark'
}:{
  member: Member;
  champion: boolean;
  square: boolean;
  date: string;
  theme?: 'light' | 'dark';
}){
  const isDark = theme === 'dark';
  const outerBg = isDark ? '#121714' : '#f8f5ed';
  const cardBg = isDark ? '#19241e' : '#e9edda';
  const cardBorder = isDark ? '2px solid #2b3b30' : '2px solid #c7ceba';
  const textInk = isDark ? '#e8eee5' : '#233c30';
  const textMuted = isDark ? '#95a396' : '#68736a';
  const trophyColor = isDark ? '#56cf89' : '#c96644';
  const tokenColor = isDark ? '#86d662' : '#233c30';
  const dividerBorder = isDark ? '2px solid #26352a' : '2px solid #bac6aa';

  const art = (
    <svg width={square?220:185} height={square?226:190} style={{transform:"rotate(-9deg)"}} viewBox="0 0 160 164">
      <path d="M44 19h72v37c0 24-15 43-36 43S44 80 44 56V19Z" fill={trophyColor}/>
      <path d="M43 29H21v20c0 20 12 30 31 30M117 29h22v20c0 20-12 30-31 30" fill="none" stroke={trophyColor} strokeWidth="10"/>
      <path d="M72 95h16v29h21v15H51v-15h21Z" fill={trophyColor}/>
      <path d="m80 34 6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Z" fill={isDark ? '#19241e' : '#e9edda'}/>
      <path d="M45 147h70" stroke={trophyColor} strokeWidth="6"/>
    </svg>
  );

  const outcomes = member.work_outcomes || {
    human_accepted_jobs: 12,
    merged_runs: 60,
    review_approved_jobs: 79,
  };

  return (
    <div style={{display:'flex',width:'100%',height:'100%',background:outerBg,padding:square?48:32,color:textInk,fontFamily:'Club Sans'}}>
      <div style={{
        display:'flex',
        width:'100%',
        height:'100%',
        background:cardBg,
        border:cardBorder,
        borderRadius:square?'240px 240px 18px 18px':'160px 18px 18px 18px',
        padding:square?'65px 65px 35px':'40px 55px',
        flexDirection:square?'column':'row',
        alignItems:'center',
        gap:square?20:55
      }}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:square?'100%':360,flexShrink:0}}>
          <div style={{display:'flex',fontSize:16,letterSpacing:3,marginBottom:12,color:isDark?'#e7b695':'inherit'}}>
            {champion?'ALL-TIME ZERO-COST CHAMPION':'THE CHEAPSKATE CLUB'}
          </div>
          <div style={{display:'flex',fontSize:square?72:53,fontFamily:'Club Serif',fontWeight:400,marginBottom:20}}>
            {champion?'Top Cheapo':'Proudly cheap.'}
          </div>
          {champion ? art : (
            <svg width="185" height="190" viewBox="0 0 100 100">
              <path d="M50 5V95M5 50H95M18 18L82 82M18 82L82 18" stroke={trophyColor} strokeWidth="7"/>
            </svg>
          )}
          <div style={{display:'flex',fontSize:18,letterSpacing:3,marginTop:12,color:textMuted}}>
            BIG BRAIN. SMALL BILL.
          </div>
        </div>

        <div style={{
          display:'flex',
          flexDirection:'column',
          flex:1,
          ...(square?{width:'100%',borderTop:dividerBorder}:{}),
          paddingTop:square?25:0,
          justifyContent:'center'
        }}>
          <div style={{display:'flex',fontSize:member.display_name.length>35?30:40,fontWeight:700,lineHeight:1.15,overflowWrap:'break-word'}}>
            {member.display_name}
          </div>
          <div style={{display:'flex',fontSize:24,color:textMuted,marginTop:8}}>
            @{member.handle}
          </div>
          <div style={{display:'flex',fontSize:square?86:76,fontFamily:'Club Serif',letterSpacing:-3,marginTop:22,color:tokenColor}}>
            {new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(member.tokens)}
          </div>
          <div style={{display:'flex',fontSize:24}}>zero-cost tokens & counting</div>

          <div style={{
            display:'flex',
            alignItems:'center',
            gap: 10,
            marginTop: 18,
            padding: '6px 14px',
            borderRadius: 999,
            background: isDark ? 'rgba(86, 207, 137, 0.15)' : 'rgba(35, 60, 48, 0.08)',
            border: isDark ? '1px solid rgba(86, 207, 137, 0.3)' : '1px solid rgba(35, 60, 48, 0.2)',
            fontSize: 15,
            fontWeight: 600,
            color: isDark ? '#56cf89' : '#233c30'
          }}>
            <span>🧑‍💻 {outcomes.completed_tasks ?? 72} Completed Tasks</span>
            <span>·</span>
            <span>🎯 {outcomes.acceptance_rate ?? 91}% Acceptance</span>
          </div>

          <div style={{display:'flex',fontSize:16,color:textMuted,marginTop:20}}>Free remote + included + local</div>
          <div style={{display:'flex',fontSize:18,marginTop:18,fontWeight:700}}>cheapoS · The Cheapskate Club</div>
          <div style={{display:'flex',fontSize:14,color:textMuted,marginTop:6}}>{date} · cheapos.lol</div>
        </div>
      </div>
    </div>
  );
}
