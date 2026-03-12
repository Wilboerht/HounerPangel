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

      {/* Total Budget Summary */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">💰 费用总结</h2>
        
        {/* 合计 */}
        <div className="bg-muted/10 border border-border rounded-2xl p-6 mb-6 text-center">
          <div className="text-sm text-muted mb-1">预计总花费</div>
          <div className="text-4xl font-bold">2571元</div>
          <div className="text-sm text-muted mt-2">不含机动费用（建议预留 800-1000 元）</div>
        </div>
        
        {/* 明细 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <Train className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">290元</div>
            <div className="text-xs text-muted">往返交通</div>
          </div>
          
          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <MapPin className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">236元</div>
            <div className="text-xs text-muted">市内交通</div>
          </div>
          
          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">1250元</div>
            <div className="text-xs text-muted">住宿</div>
          </div>
          
          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <Camera className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">255元</div>
            <div className="text-xs text-muted">门票</div>
          </div>
          
          <div className="bg-muted/5 border border-border rounded-xl p-3 text-center">
            <Utensils className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-semibold">540元</div>
            <div className="text-xs text-muted">餐饮</div>
          </div>
        </div>
      </section>
    </main>
  );
}