import { MapPin, Calendar, Wallet, Train, Coffee, Utensils, Camera } from "lucide-react";

export default function NanjingPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">🏯 南京5日详细旅行计划</h1>
        <div className="flex flex-wrap justify-center gap-4 text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            6月（5天4晚）
          </span>
          <span className="flex items-center gap-1">
            <Wallet className="w-4 h-4" />
            预算：5000元
          </span>
          <span className="flex items-center gap-1">
            <Train className="w-4 h-4" />
            出发地：上海
          </span>
        </div>
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
                <td className="py-2 pr-4">290元</td>
                <td className="py-2">高铁上海虹桥→南京南站，145元/程</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">市内交通</td>
                <td className="py-2 pr-4">200-300元</td>
                <td className="py-2">地铁公交为主，少量打车（约5-10次）</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">住宿</td>
                <td className="py-2 pr-4">1300-1600元</td>
                <td className="py-2">江北180-220元×1晚 + 市区320-400元×3晚</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">门票</td>
                <td className="py-2 pr-4">350-500元</td>
                <td className="py-2">景点门票（视具体景点而定）</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">餐饮</td>
                <td className="py-2 pr-4">1600-1900元</td>
                <td className="py-2">320-380元/天</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">机动</td>
                <td className="py-2 pr-4">800-1000元</td>
                <td className="py-2">纪念品、应急、临时升级等</td>
              </tr>
            </tbody>
          </table>
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
            <dt className="text-muted font-medium">10:00</dt>
            <dd>南京南站到达</dd>
            
            <dt className="text-muted font-medium">10:30</dt>
            <dd>地铁10号线→龙华路站（6元）</dd>
            
            <dt className="text-muted font-medium">11:00-13:00</dt>
            <dd className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 珍珠泉（泉水、瀑布、竹林）</dd>
            
            <dt className="text-muted font-medium">13:00</dt>
            <dd className="flex items-center gap-1"><Utensils className="w-3 h-3" /> 午餐：珍珠泉附近农家乐（约50元）</dd>
            
            <dt className="text-muted font-medium">14:30-16:30</dt>
            <dd>老山国家森林公园（森林氧吧）</dd>
            
            <dt className="text-muted font-medium">17:30</dt>
            <dd>入住江北酒店（200元）</dd>
            
            <dt className="text-muted font-medium">18:30</dt>
            <dd className="flex items-center gap-1"><Utensils className="w-3 h-3" /> 弘阳广场晚餐 - 南京大牌档（约60元）</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            当日花费：约361元
          </div>
        </article>

        {/* Day 2 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 2</h3>
            <span className="text-muted text-sm">中山陵 + 明孝陵 + 夫子庙</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">7:30</dt>
            <dd className="flex items-center gap-1"><Coffee className="w-3 h-3" /> 早餐：科巷 - 雍醇家汤包+糖芋苗（约25元）</dd>
            
            <dt className="text-muted font-medium">9:00</dt>
            <dd className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 梧桐大道（陵园路）</dd>
            
            <dt className="text-muted font-medium">10:00</dt>
            <dd>中山陵（免费预约）</dd>
            
            <dt className="text-muted font-medium">12:00</dt>
            <dd className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 音乐台</dd>
            
            <dt className="text-muted font-medium">13:30</dt>
            <dd>观光车→明孝陵（15元）</dd>
            
            <dt className="text-muted font-medium">16:00</dt>
            <dd>入住市区新街口酒店（350元）</dd>
            
            <dt className="text-muted font-medium">18:30</dt>
            <dd className="flex items-center gap-1"><Utensils className="w-3 h-3" /> 晚餐：蒋有记（老门东店）- 锅贴+牛肉汤（约30元）</dd>
            
            <dt className="text-muted font-medium">20:00</dt>
            <dd className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 夫子庙秦淮河风光带</dd>
            
            <dt className="text-muted font-medium">20:30</dt>
            <dd>秦淮河画舫夜游（80元）</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            当日花费：约649元
          </div>
        </article>

        {/* Day 3 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 3</h3>
            <span className="text-muted text-sm">南京博物院 + 总统府 + 中华门</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">7:30</dt>
            <dd className="flex items-center gap-1"><Coffee className="w-3 h-3" /> 早餐：科巷 - 胡记汤包+赤豆元宵（约25元）</dd>
            
            <dt className="text-muted font-medium">9:15</dt>
            <dd className="flex items-center gap-1"><Camera className="w-3 h-3" /> 南京博物院（免费预约，中国三大博物馆之一）</dd>
            
            <dt className="text-muted font-medium">12:00</dt>
            <dd className="flex items-center gap-1"><Utensils className="w-3 h-3" /> 午餐：科巷 - 鸿福皮肚面（约20元）</dd>
            
            <dt className="text-muted font-medium">14:00</dt>
            <dd className="flex items-center gap-1"><Camera className="w-3 h-3" /> 总统府（门票35元）</dd>
            
            <dt className="text-muted font-medium">15:30</dt>
            <dd>朝天宫（门票20元）</dd>
            
            <dt className="text-muted font-medium">17:30</dt>
            <dd>中华门城堡（门票50元）</dd>
            
            <dt className="text-muted font-medium">18:30</dt>
            <dd>老门东</dd>
            
            <dt className="text-muted font-medium">19:30</dt>
            <dd>打车→燕子矶看长江夜景</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            当日花费：约500元
          </div>
        </article>

        {/* Day 4 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 4</h3>
            <span className="text-muted text-sm">阅江楼 + 南京眼 + 河西</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">8:00</dt>
            <dd className="flex items-center gap-1"><Coffee className="w-3 h-3" /> 早餐：夫子庙 - 回味鸭血粉丝汤（约20元）</dd>
            
            <dt className="text-muted font-medium">9:30</dt>
            <dd className="flex items-center gap-1"><Camera className="w-3 h-3" /> 阅江楼（门票40元，长江第一楼）</dd>
            
            <dt className="text-muted font-medium">11:00</dt>
            <dd>南京长江大桥（桥头堡公园）</dd>
            
            <dt className="text-muted font-medium">12:00</dt>
            <dd className="flex items-center gap-1"><Utensils className="w-3 h-3" /> 午餐：下关码头 - 江南朋友餐厅（约50元）</dd>
            
            <dt className="text-muted font-medium">13:30</dt>
            <dd>打车→南京眼（河西，现代步行景观桥）</dd>
            
            <dt className="text-muted font-medium">16:00</dt>
            <dd>河西IFC休息/下午茶（约30元）</dd>
            
            <dt className="text-muted font-medium">18:00</dt>
            <dd className="flex items-center gap-1"><Utensils className="w-3 h-3" /> 晚餐：河西 - 鸣记小菜（约60元）</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            当日花费：约581元
          </div>
        </article>

        {/* Day 5 */}
        <article className="border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Day 5</h3>
            <span className="text-muted text-sm">玄武湖 + 鸡鸣寺 + 莫愁湖</span>
          </div>
          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-4 text-sm">
            <dt className="text-muted font-medium">7:30</dt>
            <dd className="flex items-center gap-1"><Coffee className="w-3 h-3" /> 早餐：莲湖糕团店 - 赤豆元宵+糖芋苗（约15元）</dd>
            
            <dt className="text-muted font-medium">9:00</dt>
            <dd className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 玄武湖晨练/划船</dd>
            
            <dt className="text-muted font-medium">10:30</dt>
            <dd>解放门城墙（明城墙遗址）</dd>
            
            <dt className="text-muted font-medium">12:00</dt>
            <dd className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 鸡鸣寺（金陵第一刹）</dd>
            
            <dt className="text-muted font-medium">13:00</dt>
            <dd className="flex items-center gap-1"><Utensils className="w-3 h-3" /> 午餐：鸡鸣寺素面（约25元）</dd>
            
            <dt className="text-muted font-medium">15:00</dt>
            <dd className="flex items-center gap-1"><Camera className="w-3 h-3" /> 莫愁湖公园（门票25元）</dd>
            
            <dt className="text-muted font-medium">17:00</dt>
            <dd>江南贡院（免费）</dd>
            
            <dt className="text-muted font-medium">18:00</dt>
            <dd className="flex items-center gap-1"><Utensils className="w-3 h-3" /> 晚餐：夫子庙 - 南京大牌档（约80元）</dd>
            
            <dt className="text-muted font-medium">19:30</dt>
            <dd>返程上海</dd>
          </dl>
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted">
            当日花费：约140元
          </div>
        </article>
      </section>

      {/* Attractions */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">🏛️ 景点汇总</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 珍珠泉 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">珍珠泉</h3>
            <p className="text-xs text-muted mb-2">浦口区 | 户外自然</p>
            <p className="text-sm text-muted">泉水、瀑布、竹林景观，适合休闲游览</p>
          </div>

          {/* 老山国家森林公园 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">老山国家森林公园</h3>
            <p className="text-xs text-muted mb-2">浦口区 | 自然公园</p>
            <p className="text-sm text-muted">森林氧吧，南京最大的森林公园</p>
          </div>

          {/* 梧桐大道 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">梧桐大道</h3>
            <p className="text-xs text-muted mb-2">钟山风景区 | 自然景观</p>
            <p className="text-sm text-muted">陵园路两侧的梧桐树，被誉为"南京最美道路"</p>
          </div>

          {/* 中山陵 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">中山陵</h3>
            <p className="text-xs text-muted mb-2">钟山风景区 | 历史景点</p>
            <p className="text-sm text-muted">孙中山先生的陵墓，免费预约参观</p>
          </div>

          {/* 音乐台 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">音乐台</h3>
            <p className="text-xs text-muted mb-2">钟山风景区 | 特色景观</p>
            <p className="text-sm text-muted">中山陵景区内，鸽子飞翔的浪漫场景</p>
          </div>

          {/* 明孝陵 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">明孝陵</h3>
            <p className="text-xs text-muted mb-2">钟山风景区 | 世界遗产</p>
            <p className="text-sm text-muted">朱元璋及其皇后陵墓，明代皇家陵寝代表</p>
          </div>

          {/* 夫子庙秦淮河风光带 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">夫子庙秦淮河风光带</h3>
            <p className="text-xs text-muted mb-2">秦淮区 | 文化商区</p>
            <p className="text-sm text-muted">南京最繁华的商业街，夜游秦淮河必去</p>
          </div>

          {/* 南京博物院 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">南京博物院</h3>
            <p className="text-xs text-muted mb-2">中山东路 | 博物馆</p>
            <p className="text-sm text-muted">中国三大博物馆之一，免费预约</p>
          </div>

          {/* 总统府 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">总统府</h3>
            <p className="text-xs text-muted mb-2">玄武区 | 历史景点</p>
            <p className="text-sm text-muted">民国建筑代表，曾是孙中山和蒋介石办公地</p>
          </div>

          {/* 朝天宫 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">朝天宫</h3>
            <p className="text-xs text-muted mb-2">秦淮区 | 历史景点</p>
            <p className="text-sm text-muted">清代最大古建筑群，江南地区保存最完整的明代建筑</p>
          </div>

          {/* 中华门城堡 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">中华门城堡</h3>
            <p className="text-xs text-muted mb-2">秦淮区 | 历史遗迹</p>
            <p className="text-sm text-muted">明代城墙代表，世界现存最大城门</p>
          </div>

          {/* 老门东 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">老门东</h3>
            <p className="text-xs text-muted mb-2">秦淮区 | 文化商区</p>
            <p className="text-sm text-muted">南京古城遗韵，传统小吃和历史建筑</p>
          </div>

          {/* 燕子矶 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">燕子矶</h3>
            <p className="text-xs text-muted mb-2">栖霞区 | 自然景观</p>
            <p className="text-sm text-muted">长江三大名矶之首，看长江夜景绝佳位置</p>
          </div>

          {/* 阅江楼 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">阅江楼</h3>
            <p className="text-xs text-muted mb-2">鼓楼区 | 历史景点</p>
            <p className="text-sm text-muted">"江南第一楼"，俯瞰长江壮丽景色</p>
          </div>

          {/* 南京长江大桥 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">南京长江大桥</h3>
            <p className="text-xs text-muted mb-2">鼓楼区 | 地标建筑</p>
            <p className="text-sm text-muted">新中国第一座自行设计建造的长江大桥</p>
          </div>

          {/* 南京眼 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">南京眼</h3>
            <p className="text-xs text-muted mb-2">建邺区 | 现代景观</p>
            <p className="text-sm text-muted">河西现代步行景观桥，南京新地标</p>
          </div>

          {/* 玄武湖 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">玄武湖</h3>
            <p className="text-xs text-muted mb-2">玄武区 | 城市公园</p>
            <p className="text-sm text-muted">中国四大名湖之一，适合晨练划船</p>
          </div>

          {/* 鸡鸣寺 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">鸡鸣寺</h3>
            <p className="text-xs text-muted mb-2">玄武区 | 寺庙</p>
            <p className="text-sm text-muted">"金陵第一刹"，南京最古老的梵刹之一</p>
          </div>

          {/* 莫愁湖公园 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">莫愁湖公园</h3>
            <p className="text-xs text-muted mb-2">建邺区 | 古典园林</p>
            <p className="text-sm text-muted">南京古典园林，荷花季尤为美丽</p>
          </div>

          {/* 江南贡院 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-1">江南贡院</h3>
            <p className="text-xs text-muted mb-2">秦淮区 | 历史遗迹</p>
            <p className="text-sm text-muted">中国最大科举考场遗址，免费参观</p>
          </div>
        </div>
      </section>

      {/* Food Recommendations */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">🍜 南京本地美食</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 鸡汁汤包 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">鸡汁汤包</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 雍醇家 - 科巷/丰富路 - 15元</li>
              <li>• 胡记 - 科巷 - 约15元</li>
            </ul>
          </div>

          {/* 鸭血粉丝汤 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">鸭血粉丝汤</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 回味 - 新街口/夫子庙 - 20元</li>
              <li>• 小潘记 - 评事街 - 约20元</li>
            </ul>
          </div>

          {/* 牛肉锅贴 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">牛肉锅贴</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 鲍记 - 评事街 - 10元</li>
              <li>• 蒋有记 - 老门东 - 30元</li>
            </ul>
          </div>

          {/* 盐水鸭 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">盐水鸭</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 金宏兴 - 约40元/份</li>
              <li>• 大行宫 - 约40元/份</li>
            </ul>
          </div>

          {/* 赤豆元宵 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">赤豆元宵</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 莲湖糕团店 - 夫子庙 - 10元</li>
            </ul>
          </div>

          {/* 皮肚面 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">皮肚面</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 鸿福皮肚面 - 科巷 - 20元</li>
              <li>• 小潘记 - 评事街 - 35元</li>
            </ul>
          </div>

          {/* 饺面 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">饺面</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 陆氏老铺 - 老门东 - 约25元</li>
            </ul>
          </div>

          {/* 美龄粥 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">美龄粥</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 南京大牌档 - 新街口/河西 - 80元</li>
            </ul>
          </div>

          {/* 家常菜 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">家常菜</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 鸣记小菜 - 河西 - 60元</li>
              <li>• 金陵小巷 - 新街口 - 100元</li>
            </ul>
          </div>

          {/* 小笼包 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">小笼包</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 胡记 - 科巷 - 约15元</li>
            </ul>
          </div>

          {/* 糖芋苗 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">糖芋苗</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 莲湖糕团店 - 夫子庙 - 约10元</li>
            </ul>
          </div>

          {/* 牛肉汤 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">牛肉汤</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 蒋有记 - 老门东 - 约15元</li>
            </ul>
          </div>

          {/* 鸡鸣寺素面 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">鸡鸣寺素面</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 鸡鸣寺 - 25元</li>
            </ul>
          </div>

          {/* 南京名点 */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">南京名点</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• 河西IFC - 下午茶 - 30元</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Total Budget Summary */}
      <section className="mt-12 p-6 bg-muted/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">💰 费用总结</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">290元</div>
            <div className="text-sm text-muted">往返交通</div>
          </div>
          <div>
            <div className="text-2xl font-bold">235元</div>
            <div className="text-sm text-muted">市内交通</div>
          </div>
          <div>
            <div className="text-2xl font-bold">1450元</div>
            <div className="text-sm text-muted">住宿</div>
          </div>
          <div>
            <div className="text-2xl font-bold">255元</div>
            <div className="text-sm text-muted">门票</div>
          </div>
          <div>
            <div className="text-2xl font-bold">540元</div>
            <div className="text-sm text-muted">餐饮</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border text-center">
          <span className="text-lg font-semibold">总计：约2770元（不含机动800-1000元）</span>
        </div>
      </section>
    </main>
  );
}