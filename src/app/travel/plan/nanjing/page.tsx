import { MapPin, Calendar, Wallet, Train, Utensils, Ticket } from "lucide-react";

export default function NanjingPage() {
  return (
    <main className="min-h-screen px-6 pt-12 pb-0 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">🏯 南京5日旅行计划</h1>
        <p className="text-muted text-sm font-mono uppercase tracking-widest">
          2026.07.xx — 2026.07.xx
        </p>
      </header>

      {/* Budget Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">📦 预算明细</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4">项目</th>
                <th className="text-left py-2 pr-4">预算区间</th>
                <th className="text-left py-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border">
                <td className="py-2 pr-4">往返交通</td>
                <td className="py-2 pr-4">300元</td>
                <td className="py-2">高铁 上海站→南京站 & 南京南站→上海虹桥，二等座</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">市内交通</td>
                <td className="py-2 pr-4">350-400/600元</td>
                <td className="py-2">地铁/公交为主，适当选择打车（到顶上浮 200 元）</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">住宿</td>
                <td className="py-2 pr-4">800-1000元</td>
                <td className="py-2">Day 1,2,4 酒店（约 150-300 元/晚 ×3 晚），Day3 青旅（约 40-90 元/晚 ×1 晚）</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">门票</td>
                <td className="py-2 pr-4">300-400元</td>
                <td className="py-2">含钟山风景区、总统府、明城墙门票等（注意提前预约部分景点！）</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">餐饮</td>
                <td className="py-2 pr-4">1200-1500元</td>
                <td className="py-2">南京老字号和老店中评分标准（150-240/天）</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">机动/购物</td>
                <td className="py-2 pr-4">400-500元</td>
                <td className="py-2">金陵小吃、伴手礼、临时开销</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Route Map */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">🗺️ 行程路线图</h2>
        <div className="bg-muted/10 border border-border rounded-lg p-6">
          <div className="flex flex-col items-center gap-2 text-sm">
            <div className="text-center">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Day 1</span>
            </div>
            <div className="text-center text-muted">南京站 → 珍珠泉 → 老山</div>
            <span className="text-muted">↓</span>
            <div className="text-center">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Day 2</span>
            </div>
            <div className="text-center text-muted">江北 → 梧桐大道 → 中山陵 → 明孝陵 → 夫子庙秦淮河（夜景）</div>
            <span className="text-muted">↓</span>
            <div className="text-center">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Day 3</span>
            </div>
            <div className="text-center text-muted">城中（博物院/总统府/新街口/朝天宫/中华门/老门东）</div>
            <span className="text-muted">↓</span>
            <div className="text-center">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Day 4</span>
            </div>
            <div className="text-center text-muted">长江（阅江楼/大桥） → 河西（鱼嘴落日/灯塔/南京眼夜景）</div>
            <span className="text-muted">↓</span>
            <div className="text-center">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Day 5</span>
            </div>
            <div className="text-center text-muted">玄武湖/鸡鸣寺/莫愁湖 → 新街口午餐/购物 → 返程</div>
          </div>
        </div>
      </section>

      {/* Daily Itinerary */}
      <section className="space-y-12">
        <h2 className="text-2xl font-semibold">📅 每日详细行程</h2>

        {/* Day 1 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 1</h3>
            <span className="text-muted text-sm">珍珠泉 + 老山国家森林公园</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">10:00 - 10:30</dt>
            <dd>南京站到达（从北广场出站，看玄武湖湖景）</dd>

            <dt className="text-muted font-medium">10:30 - 11:00</dt>
            <dd>地铁10号线→龙华路站（6元）</dd>

            <dt className="text-muted font-medium">11:00 - 13:00</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 珍珠泉（泉水、瀑布、竹林）</dd>

            <dt className="text-muted font-medium">13:00 - 14:30</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 午餐：珍珠泉附近农家乐（约50元）</dd>

            <dt className="text-muted font-medium">14:30 - 16:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 老山国家森林公园（森林氧吧）</dd>

            <dt className="text-muted font-medium">17:30 - 18:30</dt>
            <dd>入住江北酒店（200元）</dd>

            <dt className="text-muted font-medium">18:30 - 19:30</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 弘阳广场晚餐 - 南京大牌档（约60元）</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            预计花费：约650元（含首日江北住宿及地铁）
          </div>
        </article>

        {/* Day 2 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 2</h3>
            <span className="text-muted text-sm">中山陵 + 明孝陵 + 夫子庙</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">07:30 - 08:30</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 早餐：科巷 - 雍醇家汤包+糖芋苗（约25元）</dd>

            <dt className="text-muted font-medium">09:00 - 12:00</dt>
            <dd>梧桐大道骑行/漫步至中山陵景区</dd>

            <dt className="text-muted font-medium">12:00 - 13:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 音乐台（看鸽子起飞）</dd>

            <dt className="text-muted font-medium">13:30 - 15:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 观光车→明孝陵（赏石象路/石柱路，门票70元）</dd>

            <dt className="text-muted font-medium">16:00 - 17:30</dt>
            <dd>入住市区新街口酒店（350元）</dd>

            <dt className="text-muted font-medium">18:30 - 20:00</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 晚餐：蒋有记（老门东店）- 锅贴+牛肉汤（约30元）</dd>

            <dt className="text-muted font-medium">20:00 - 21:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 夫子庙秦淮河风光带 + 画舫夜游（80元）</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            预计花费：约850元（含钟山套票及精致晚餐）
          </div>
        </article>

        {/* Day 3 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 3</h3>
            <span className="text-muted text-sm">南京博物院 + 新街口 + 总统府 + 中华门/老门东</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">07:30 - 08:30</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 早餐：科巷 - 胡记汤包+赤豆元宵（约25元）</dd>

            <dt className="text-muted font-medium">09:15 - 12:15</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 南京博物院（建议游览3小时，深度看民国馆）</dd>

            <dt className="text-muted font-medium">12:30 - 14:00</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 午餐：南博附近或返回科巷美食街（约30元）</dd>

            <dt className="text-muted font-medium">14:00 - 16:00</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 总统府（就在南博附近，门票35元）</dd>

            <dt className="text-muted font-medium">16:00 - 17:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 朝天宫（红墙黛瓦，非常出片，门票20元）</dd>

            <dt className="text-muted font-medium">17:30 - 18:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 中华门城堡登城墙（看落日，门票50元）</dd>

            <dt className="text-muted font-medium">18:30 - 20:00</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 晚餐：老门东（寻找当地特色小吃，约50元）</dd>

            <dt className="text-muted font-medium">20:00 - 21:00</dt>
            <dd>返回酒店休息，缓解体力</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            预计花费：约750元（包含博物院之旅及青旅/老店餐饮）
          </div>
        </article>

        {/* Day 4 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 4</h3>
            <span className="text-muted text-sm">阅江楼 + 长江大桥 + 燕子矶 + 南京眼</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">08:00 - 09:00</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 早餐：新街口 - 芳婆糕团店（约20元）</dd>

            <dt className="text-muted font-medium">09:30 - 11:00</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 阅江楼（俯瞰长江，门票40元）</dd>

            <dt className="text-muted font-medium">11:00 - 12:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 南京长江大桥（桥头堡及江边公园走走）</dd>

            <dt className="text-muted font-medium">12:30 - 14:00</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 午餐：阅江楼附近（约50元）</dd>

            <dt className="text-muted font-medium">15:00 - 17:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 打车前往 燕子矶（看长江日落绝佳点，门票10元）</dd>

            <dt className="text-muted font-medium">18:00 - 19:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 打车至河西 国际青年会议中心</dd>

            <dt className="text-muted font-medium">19:30 - 21:00</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 南京眼步行桥（夜景地标，免费）</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            预计花费：约850元（含打车游览及鱼嘴日落补给）
          </div>
        </article>

        {/* Day 5 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 5</h3>
            <span className="text-muted text-sm">玄武湖 + 鸡鸣寺 + 莫愁湖 + 返程</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">07:30 - 08:30</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 早餐：芳婆糕团店 - 乌饭团+老卤蛋（约15元）</dd>

            <dt className="text-muted font-medium">08:00 - 09:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 鸡鸣寺（建议趁早，祈福结束后从解放门进玄武湖）</dd>

            <dt className="text-muted font-medium">09:30 - 11:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 玄武湖游湖（漫步五洲，看金陵明珠）</dd>

            <dt className="text-muted font-medium">12:00 - 13:30</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 午餐：新街口区域或本帮小吃（约30元）</dd>

            <dt className="text-muted font-medium">14:00 - 15:30</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 莫愁湖公园（门票35元）</dd>

            <dt className="text-muted font-medium">16:00 - 18:00</dt>
            <dd className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 新街口（末班扫货、购特产盐水鸭）</dd>

            <dt className="text-muted font-medium">18:00 - 19:30</dt>
            <dd className="flex items-start gap-1"><Utensils className="w-3 h-3 mt-1 shrink-0 text-muted opacity-40" /> 晚餐：小潘记鸭血粉丝汤（约35元）</dd>

            <dt className="text-muted font-medium">19:30 - 20:45</dt>
            <dd>前往南京南站，返程上海</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            预计花费：约700元（含返程补给、纪念品采购及车票分摊）
          </div>
        </article>
      </section>

      {/* Attractions */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">🏛️ 景点汇总</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4">景点</th>
                <th className="text-left py-2 pr-4">位置</th>
                <th className="text-left py-2">简介</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border">
                <td className="py-2 pr-4">珍珠泉</td>
                <td className="py-2 pr-4">浦口区</td>
                <td className="py-2">泉水、瀑布、竹林景观，适合休闲游览</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">老山国家森林公园</td>
                <td className="py-2 pr-4">浦口区</td>
                <td className="py-2">森林氧吧，南京最大的森林公园</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">梧桐大道</td>
                <td className="py-2 pr-4">钟山风景区</td>
                <td className="py-2">陵园路两侧的梧桐树，被誉为"南京最美道路"</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">中山陵</td>
                <td className="py-2 pr-4">钟山风景区</td>
                <td className="py-2">孙中山先生的陵墓，免费预约参观</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">音乐台</td>
                <td className="py-2 pr-4">钟山风景区</td>
                <td className="py-2">中山陵景区内，鸽子飞翔的浪漫场景</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">明孝陵</td>
                <td className="py-2 pr-4">钟山风景区</td>
                <td className="py-2">朱元璋及其皇后陵墓，明代皇家陵寝代表</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">夫子庙秦淮河风光带</td>
                <td className="py-2 pr-4">秦淮区</td>
                <td className="py-2">南京最繁华的商业街，夜游秦淮河必去</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">南京博物院</td>
                <td className="py-2 pr-4">中山东路</td>
                <td className="py-2">中国三大博物馆之一，免费预约</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">新街口</td>
                <td className="py-2 pr-4">玄武区</td>
                <td className="py-2">中华第一商圈，购物美食一站式</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">总统府</td>
                <td className="py-2 pr-4">玄武区</td>
                <td className="py-2">民国建筑代表，曾是孙中山和蒋介石办公地</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">朝天宫</td>
                <td className="py-2 pr-4">秦淮区</td>
                <td className="py-2">清代最大古建筑群，江南地区保存最完整的明代建筑</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">中华门城堡</td>
                <td className="py-2 pr-4">秦淮区</td>
                <td className="py-2">明代城墙代表，世界现存最大城门</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">老门东</td>
                <td className="py-2 pr-4">秦淮区</td>
                <td className="py-2">南京古城遗韵，传统小吃和历史建筑</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">燕子矶</td>
                <td className="py-2 pr-4">栖霞区</td>
                <td className="py-2">长江三大名矶之首，看长江夜景绝佳位置</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">阅江楼</td>
                <td className="py-2 pr-4">鼓楼区</td>
                <td className="py-2">"江南第一楼"，俯瞰长江壮丽景色</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">南京长江大桥</td>
                <td className="py-2 pr-4">鼓楼区</td>
                <td className="py-2">新中国第一座自行设计建造的长江大桥</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">南京眼</td>
                <td className="py-2 pr-4">建邺区</td>
                <td className="py-2">河西现代步行景观桥，南京新地标</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">鱼嘴湿地公园</td>
                <td className="py-2 pr-4">建邺区</td>
                <td className="py-2">红白灯塔、绝美日落、出片率极高</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">玄武湖</td>
                <td className="py-2 pr-4">玄武区</td>
                <td className="py-2">中国四大名湖之一，适合晨练划船</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">鸡鸣寺</td>
                <td className="py-2 pr-4">玄武区</td>
                <td className="py-2">"金陵第一刹"，南京最古老的梵刹之一</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">莫愁湖公园</td>
                <td className="py-2 pr-4">建邺区</td>
                <td className="py-2">南京古典园林，荷花季尤为美丽</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">江南贡院</td>
                <td className="py-2 pr-4">秦淮区</td>
                <td className="py-2">中国最大科举考场遗址，免费参观</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Food Recommendations */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">🍜 南京本地美食</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">美食类型</th>
                <th className="text-left py-3 px-4 font-semibold">店铺</th>
                <th className="text-left py-3 px-4 font-semibold">位置</th>
                <th className="text-left py-3 px-4 font-semibold">价格</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4" rowSpan={2}>鸡汁汤包</td>
                <td className="py-3 px-4">雍醇家</td>
                <td className="py-3 px-4">科巷/丰富路</td>
                <td className="py-3 px-4">15元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">胡记</td>
                <td className="py-3 px-4">科巷</td>
                <td className="py-3 px-4">约15元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">赤豆元宵</td>
                <td className="py-3 px-4">莲湖糕团店</td>
                <td className="py-3 px-4">夫子庙</td>
                <td className="py-3 px-4">10元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4" rowSpan={2}>皮肚面</td>
                <td className="py-3 px-4">鸿福皮肚面</td>
                <td className="py-3 px-4">科巷</td>
                <td className="py-3 px-4">20元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">小潘记</td>
                <td className="py-3 px-4">评事街</td>
                <td className="py-3 px-4">35元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">饺面</td>
                <td className="py-3 px-4">陆氏老铺</td>
                <td className="py-3 px-4">老门东</td>
                <td className="py-3 px-4">约25元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">美龄粥</td>
                <td className="py-3 px-4">南京大牌档</td>
                <td className="py-3 px-4">新街口/河西</td>
                <td className="py-3 px-4">约80元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4" rowSpan={2}>家常菜</td>
                <td className="py-3 px-4">鸣记小菜</td>
                <td className="py-3 px-4">河西</td>
                <td className="py-3 px-4">60元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">金陵小巷</td>
                <td className="py-3 px-4">新街口</td>
                <td className="py-3 px-4">100元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">小笼包</td>
                <td className="py-3 px-4">胡记</td>
                <td className="py-3 px-4">科巷</td>
                <td className="py-3 px-4">约15元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">糖芋苗</td>
                <td className="py-3 px-4">莲湖糕团店</td>
                <td className="py-3 px-4">夫子庙</td>
                <td className="py-3 px-4">约10元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">牛肉汤</td>
                <td className="py-3 px-4">蒋有记</td>
                <td className="py-3 px-4">老门东</td>
                <td className="py-3 px-4">约15元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">鸡鸣寺素面</td>
                <td className="py-3 px-4">鸡鸣寺</td>
                <td className="py-3 px-4">鸡鸣寺</td>
                <td className="py-3 px-4">25元</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">下午茶</td>
                <td className="py-3 px-4">河西IFC</td>
                <td className="py-3 px-4">河西</td>
                <td className="py-3 px-4">约30元</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Food Footer Note */}
      <section className="mt-8 text-center">
        <p className="text-sm text-muted">※ 以上价格为单人均价，根据实际存在浮动</p>
      </section>

      {/* Total Budget Summary */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">💰 费用总结</h2>

        {/* 合计 */}
        <div className="bg-muted/10 border border-border rounded-2xl p-6 mb-6 text-center">
          <div className="text-sm text-muted mb-1">预计总花费（含机动/高性价比）</div>
          <div className="text-4xl font-bold">3800元</div>
          <div className="text-sm text-muted mt-2">基于最新的混合住宿（酒店/青旅）与老字号餐饮方案核算，包含 450 元购物机动</div>
        </div>

        {/* 明细 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <Train className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">300元</div>
            <div className="text-xs text-muted">往返交通</div>
          </div>

          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <MapPin className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">450元</div>
            <div className="text-xs text-muted">市内交通</div>
          </div>

          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">900元</div>
            <div className="text-xs text-muted">混合住宿</div>
          </div>

          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <Ticket className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">350元</div>
            <div className="text-xs text-muted">门票费用</div>
          </div>

          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <Utensils className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">1350元</div>
            <div className="text-xs text-muted">美食餐饮</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-border text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} wilboerht. All rights reserved.</p>
      </footer>
    </main>
  );
}