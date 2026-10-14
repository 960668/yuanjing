/* chxb/shensha, MIT. Source blob 017f676caeb1dccbdd315f2468e672112a235baa. See shensha-LICENSE.txt. */
var JIAZI = [
        "　", 
        "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉", 
        "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未", 
        "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳", 
        "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯", 
        "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
        "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥" ];

/**
 * 根据干支和八字信息，查询神煞组合。
 * @param String ganzhi 要查询神煞的某柱干支，例如年柱为甲寅，则参数值为：甲寅
 * @param Array bazi 八字数组，数组元素从0-7，分别是年干、年支、月干、月支、日干、日支、时干、时支
 * @param boolean isman 性别，true为男，否则为女
 * @param int witch 查的是哪一柱，1，2，3，4分别代表年/月/日/时柱。其它分别是5大运，6流年，7流月，8流时。
 * @param String 年柱纳音,查询学堂、词馆神煞时用。例如：海中金
 * @returns Array 返回神煞数组
 */
function queryShenSha(ganzhi, bazi, isman, witch, niannayin) {
    var shengShaList = [];
    var niangan = bazi[0];
    var nianzhi = bazi[1];
    var yuegan = bazi[2];
    var yuezhi = bazi[3];
    var rigan = bazi[4];
    var rizhi = bazi[5];
    var shigan = bazi[6];
    var shizhi = bazi[7];
    var gan = ganzhi.substring(0, 1);
    var zhi = ganzhi.substring(1, 2);
    if ((tianyiguiren(rigan, zhi) == 1) || (tianyiguiren(niangan, zhi) == 1)) {
        shengShaList.push("天乙");
    }
    if ((taijiguiren(rigan, zhi) == 1) || (taijiguiren(niangan, zhi) == 1)) {
        shengShaList.push("太极");
    }
    if ((tiandeguiren(yuezhi, gan) == 1) || (tiandeguiren(yuezhi, zhi) == 1)) {
        shengShaList.push("天德");
    }
    if (yuede(yuezhi, gan) == 1) {
        shengShaList.push("月德");
    }
    if (dexiuguiren(yuezhi, [niangan, yuegan, rigan, shigan]) == 1) {
        shengShaList.push("德秀");
    }
    if( (tiandehe(yuezhi, gan)==1) || (tiandehe(yuezhi, zhi)==1)){
        shengShaList.push("天德合");
    }
    if( yuedehe(yuezhi, gan)==1 ){
        shengShaList.push("月德合");
    }
    if( (fuxing(niangan, zhi)==1) || (fuxing(rigan, zhi)==1) ){
        shengShaList.push("福星");
    }
    if ((wenchang(rigan, zhi) == 1) || (wenchang(niangan, zhi) == 1)) {
        shengShaList.push("文昌");
    }
    if ( (witch!=3) && xuetang(niannayin, gan, zhi)==1 ){
        shengShaList.push("学堂");
    }
    if ( (witch!=3) && ciguan(niannayin, gan, zhi)==1 ){
        shengShaList.push("词馆");
    }
    //仅查本命局
    if( (witch==3)&&kuigang(rigan, rizhi) == 1 ){
        shengShaList.push("魁罡");
    }
    if ((guoying(rigan, zhi) == 1) || (guoying(niangan, zhi) == 1)) {
        shengShaList.push("国印");
    }
    if (( (witch!=3) && yima(rizhi, zhi) == 1) || ((witch!=1)&&yima(nianzhi, zhi) == 1)) {
        shengShaList.push("驿马");
    }
    if (((witch!=3)&&huagai(rizhi, zhi) == 1) || ((witch!=1)&&huagai(nianzhi, zhi) == 1)) {
        shengShaList.push("华盖");
    }
    if (((witch!=3)&&jiangxing(rizhi, zhi) == 1) || ((witch!=1)&&jiangxing(nianzhi, zhi) == 1)) {
        shengShaList.push("将星");
    }
    if ((jingyu(rigan, zhi) == 1) || (jingyu(niangan, zhi) == 1)) {
        shengShaList.push("金舆");
    }
    if (  (witch==3 &&  (jinshen(rigan, rizhi) == 1) ) || (witch==4 &&(jinshen(shigan, shizhi) == 1) )) {
        shengShaList.push("金神");
    }
    if (  (witch!=2) && wugui(yuezhi, zhi) ) {
        shengShaList.push("五鬼");
    }
    if( (witch!=2)&&tianyi(yuezhi, zhi) == 1 ){
        shengShaList.push("天医");
    }
    if (lushen(rigan, zhi) == 1) {
        shengShaList.push("禄神");
    }
    if( tianshe(yuezhi, rigan, rizhi)==1 ){
        shengShaList.push("天赦");
    }
    if ((witch!=1)&&hongluan(nianzhi, zhi) == 1) {
        shengShaList.push("红鸾");
    }
    if ((witch!=1)&&tianxi(nianzhi, zhi) == 1) {
        shengShaList.push("天喜");
    }
    if( liuxia(rigan, zhi)==1 ){
        shengShaList.push("流霞");
    }
    if( hongyan(rigan, zhi)==1 ){
        shengShaList.push("红艳");
    }
    if (((witch!=3)&&tianluo(rizhi, zhi) == 1) || ((witch!=1)&&tianluo(nianzhi, zhi) == 1)) {
        shengShaList.push("天罗");
    }
    if (((witch!=3)&&diwang(rizhi, zhi) == 1) || ((witch!=1)&&diwang(nianzhi, zhi) == 1)) {
        shengShaList.push("地网");
    }
    if (yangren(rigan, zhi) == 1) {
        shengShaList.push("羊刃");
    }
    if (feiren(rigan, zhi) == 1) {
        shengShaList.push("飞刃");
    }
    if ((xueren(yuezhi, zhi) == 1)) {
        shengShaList.push("血刃");
    }
    if ( (witch==3) && bazhuan(rigan, rizhi) == 1){
        shengShaList.push("八专");
    }
    if ( (witch==3) && jiuchou(rigan, rizhi) == 1){
        shengShaList.push("九丑");
    }
    if( (jiesha(rizhi, zhi) == 1) || (jiesha(nianzhi, zhi) == 1)  ){
        shengShaList.push("劫煞");
    }
    if( (zaisha(nianzhi, zhi)==1) ){
        shengShaList.push("灾煞");
    }
    if ((witch!=1)&&yuancheng(nianzhi, zhi, isman, tianganYinyang(niangan)) == 1) {
        shengShaList.push("元辰");
    }
    if (((witch!=3)&&kongwang(rigan+rizhi, zhi) == 1) || ((witch!=1)&&kongwang(niangan+nianzhi, zhi) == 1)) {
        shengShaList.push("空亡");
    }
    if( ((witch==3)&&tongzi(yuezhi, niannayin, rizhi)) || ((witch==4)&&tongzi(yuezhi, niannayin, shizhi)) ){
        shengShaList.push("童子");
    }
    if (tianchu(niangan, rigan, zhi) == 1) {
        shengShaList.push("天厨");
    }
    if( (witch!=1)&&gucheng(nianzhi, zhi)== 1){
        shengShaList.push("孤辰");
    }
    if( (witch!=1)&&guashu(nianzhi, zhi)== 1){
        shengShaList.push("寡宿");
    }
    if( ((witch!=3)&&wangshen(rizhi, zhi)==1) || ((witch!=1)&&wangshen(nianzhi, zhi)==1) ){
        shengShaList.push("亡神");
    }
    if( (witch==3)&&shiedabai(rigan, rizhi)==1 ){
        shengShaList.push("十恶大败");
    }
    if ((taohua(rizhi, zhi) == 1) || (taohua(nianzhi, zhi) == 1)) {
        shengShaList.push("桃花");
    }
    if( (witch==3)&&guluan(rigan, rizhi)==1 ){
        shengShaList.push("孤鸾");
    }
    if( (witch==3)&&yingyangchacuo(rigan, rizhi)==1 ){
        shengShaList.push("阴差阳错");
    }
    if( (witch==3)&&sifei(yuezhi, rigan, rizhi)==1 ){
        shengShaList.push("四废");
    }
    if (((witch!=1)&&shangmen(nianzhi, zhi) == 1)) {
        shengShaList.push("丧门");
    }
    if (((witch!=1)&&diaoke(nianzhi, zhi) == 1)) {
        shengShaList.push("吊客");
    }
    if (((witch!=1)&&pima(nianzhi, zhi) == 1)) {
        shengShaList.push("披麻");
    }
    if ( (witch==3)&&shiling(rigan,rizhi)==1 ){
        shengShaList.push("十灵");
    }

    return shengShaList;
}

/**
 * 天厨贵人。
 * 查法：
 * 以年干、日干查余四支。
 * 丙干见巳，丁干见午
 * 戊干见申，己干见酉
 * 庚干见亥，辛干见子
 * 壬干见寅，癸干见卯
 * @param yearGan 年干
 * @param dayGan 日干
 * @param dizhi 地支
*/
function tianchu(yearGan, dayGan, dizhi) {
    const tianChuRules = {
        '丙': '巳',
        '丁': '午',
        '戊': '申',
        '己': '酉',
        '庚': '亥',
        '辛': '子',
        '壬': '寅',
        '癸': '卯'
    };
    return (tianChuRules[yearGan] === dizhi || tianChuRules[dayGan] === dizhi) ? 1:0;
}

/**
 * 德秀贵人
 * 《三命通会》中云："德者，本月生旺之气；秀者，合天地中和之气，五行变化而成者也。"
 * 寅午戌月，丙丁为德，戊癸为秀；
 * 申子辰月，壬癸戊己为德，丙辛甲己为秀；
 * 巳酉丑月，庚辛为德，乙庚为秀；
 * 亥卯未月，甲乙为德，丁壬为秀。
 * 
 * @param yuezhi 月支
 * @param tiangans 天干数组，包含年干、月干、日干、时干
 * @return 返回1表示是德秀贵人，0表示不是
 */
function dexiuguiren(yuezhi, tiangans) {
    // 检查是否有特定天干
    function hasTiangan(targetGans) {
        return tiangans.some(gan => targetGans.includes(gan));
    }
    
    // 检查是否有特定天干组合
    function hasTianganCombination(gan1, gan2) {
        return tiangans.includes(gan1) && tiangans.includes(gan2);
    }
    
    // 火局：寅午戌
    if (["寅", "午", "戌"].includes(yuezhi)) {
        // 德：丙丁，秀：戊癸
        return hasTiangan(["丙", "丁"]) && hasTianganCombination("戊", "癸") ? 1 : 0;
    }
    
    // 水局：申子辰
    else if (["申", "子", "辰"].includes(yuezhi)) {
        // 德：壬癸戊己，秀：丙辛或甲己
        return hasTiangan(["壬", "癸", "戊", "己"]) && 
            (hasTianganCombination("丙", "辛") || hasTianganCombination("甲", "己")) ? 1 : 0;
    }
    
    // 金局：巳酉丑
    else if (["巳", "酉", "丑"].includes(yuezhi)) {
        // 德：庚辛，秀：乙庚
        return hasTiangan(["庚", "辛"]) && hasTianganCombination("乙", "庚") ? 1 : 0;
    }
    
    // 木局：亥卯未
    else if (["亥", "卯", "未"].includes(yuezhi)) {
        // 德：甲乙，秀：丁壬
        return hasTiangan(["甲", "乙"]) && hasTianganCombination("丁", "壬") ? 1 : 0;
    }
    
    return 0;
}

/**
 * 甲子旬在戌亥。甲戌旬在申酉。甲申旬在午未。
 * 甲午旬在辰巳。甲辰旬在寅卯。甲寅旬在子丑。
 * 查法：以日/年柱，见余三地支
 * 查法: 以日柱为主, 柱中年、 月、 时支见者为空亡.
 *
 * @param ganzhi 干支
 * @param dizhi 地支
 * @return
 */
function kongwang(ganzhi, dizhi) {
    var idx = getJiaziOrder(ganzhi);
    if (    ((idx <= 10) && ((dizhi==("戌")) || (dizhi==("亥"))))
            || ((idx > 10) && (idx <= 20) && ((dizhi==("申")) || (dizhi==("酉"))))
            || ((idx > 20) && (idx <= 30) && ((dizhi==("午")) || (dizhi==("未"))))
            || ((idx > 30) && (idx <= 40) && ((dizhi==("辰")) || (dizhi==("巳"))))
            || ((idx> 40) && (idx<= 50) && ((dizhi==("寅")) || (dizhi==("卯"))))
            || ((idx > 50) && ((dizhi==("子")) || (dizhi==("丑"))))) {
        return 1;
    }
    return 0;
}

/**
 * 挑花:
 * 申子辰在酉, 寅午戌在卯, 
 * 巳酉丑在午, 亥卯未在子. 
 * 查法: 以年支或日支查四柱其它地支.
 *
 * @param paramString1 年支/日支
 * @param paramString2 地支
 * @return
 */
function taohua(paramString1, paramString2) {
    const conditions = {
        "申": "酉",
        "子": "酉",
        "辰": "酉",
        "寅": "卯",
        "午": "卯",
        "戌": "卯",
        "巳": "午",
        "酉": "午",
        "丑": "午",
        "亥": "子",
        "卯": "子",
        "未": "子"
    };

    return conditions[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 阴阳差错:
 * 丙子, 丁丑, 戊寅, 辛卯, 壬辰, 癸巳, 
 * 丙午, 丁未, 戊申, 辛酉, 壬戌, 癸亥. 
 * 查法: 日柱见者为是.
 *
 * @param paramString1 日干
 * @param paramString2 日支
 * @return
 */
function yingyangchacuo(paramString1, paramString2) {
    const conditions = {
        "丙": ["子", "午"],
        "丁": ["丑", "未"],
        "戊": ["寅", "申"],
        "辛": ["卯", "酉"],
        "壬": ["辰", "戌"],
        "癸": ["巳", "亥"]
    };

    return conditions[paramString1]?.includes(paramString2) ? 1 : 0;
}

/**
 * 天乙贵人 甲戊并牛羊, 乙己鼠猴乡, 丙丁猪鸡位, 壬癸兔蛇藏, 庚辛逢虎马, 此是贵人方. 
 * 查 法: 以日干年干起贵人, 地支见者为是
 *
 * @param paramString1 日干
 * @param paramString2 地支
 * @return
 */
function tianyiguiren(paramString1, paramString2) {
    const conditions = {
        "甲": ["丑", "未"],
        "戊": ["丑", "未"],
        "乙": ["申", "子"],
        "己": ["申", "子"],
        "丙": ["亥", "酉"],
        "丁": ["亥", "酉"],
        "壬": ["卯", "巳"],
        "癸": ["卯", "巳"],
        "庚": ["午", "寅"],
        "辛": ["午", "寅"]
    };

    return Array.isArray(conditions[paramString1]) && conditions[paramString1].includes(paramString2) ? 1 : 0;
}

/**
 * 太极贵人: 
 * 甲乙生人子午中,丙丁鸡兔定亨通,
 * 戊己两干临四季,庚辛寅亥禄丰隆,
 * 壬癸巳申偏喜美,值此应当福气钟,
 * 更须贵格来相扶,候封万户到三公.
 * 查法：以日/年干查四地支
 *
 * @param paramString1 日干
 * @param paramString2 地支
 * @return
 */
function taijiguiren(paramString1, paramString2) {
    const conditions = {
        "甲": ["子", "午"],
        "乙": ["子", "午"],
        "丙": ["酉", "卯"],
        "丁": ["酉", "卯"],
        "庚": ["寅", "亥"],
        "辛": ["寅", "亥"],
        "壬": ["申", "巳"],
        "癸": ["申", "巳"],
        "戊": "土",
        "己": "土"
    };

    if (Array.isArray(conditions[paramString1])) {
        return conditions[paramString1].includes(paramString2) ? 1 : 0;
    }

    if ((paramString1 === "戊" || paramString1 === "己") && dizhiWuxing(paramString2) === "土") {
        return 1;
    }

    return 0;
}

/**
 * 文昌贵人: 
 * 甲乙巳午报君知, 丙戊申宫丁己鸡.
 * 庚猪辛鼠壬逢虎, 癸人见卯入云梯. 
 * 
 * 查法: 以年干或日干为主, 凡四柱中地支所见者为是
 *
 * @param paramString1 年干/日干
 * @param paramString2 地支
 * @return
 */
function wenchang(paramString1, paramString2) {
    const conditions = {
        "甲": "巳",
        "乙": "午",
        "丙": "申",
        "丁": "酉",
        "戊": "申",
        "己": "酉",
        "庚": "亥",
        "辛": "子",
        "壬": "寅",
        "癸": "卯"
    };

    return conditions[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 魁罡贵人: 
 * 壬辰庚戌与庚辰, 戊戌魁罡四座神, 
 * 不见财官刑煞并,身行旺地贵无伦. 
 * 查法: 日柱见者为是
 *
 * @param paramString1 日干
 * @param paramString2 日支
 * @return
 */
function kuigang(paramString1, paramString2) {
    const conditions = {
        "壬": "辰",
        "庚": ["戌", "辰"],
        "戊": "戌"
    };

    if (Array.isArray(conditions[paramString1])) {
        return conditions[paramString1].includes(paramString2) ? 1 : 0;
    }

    return conditions[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 驿马: 
 * 申子辰马在寅, 寅午戌马在申,
 * 巳酉丑马在亥, 亥卯未马在巳.
 * 查法：以年、日支查余三支
 * @param paramString1 年支/日支
 * @param paramString2 地支
 * @return
 */
function yima(paramString1, paramString2) {
    const conditions = {
        "申": "寅",
        "子": "寅",
        "辰": "寅",
        "寅": "申",
        "午": "申",
        "戌": "申",
        "亥": "巳",
        "卯": "巳",
        "未": "巳",
        "巳": "亥",
        "酉": "亥",
        "丑": "亥"
    };

    return conditions[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 华盖: 
 * 寅午戌见戌, 亥卯未见未, 
 * 申子辰见辰, 巳酉丑见丑. 
 * 查法： 以年支或日支为主, 凡四柱中所见者为有华盖星.
 *
 * @param paramString1 年支/日支
 * @param paramString2 地支
 * @return
 */
function huagai(paramString1, paramString2) {
    const conditions = {
        "申": "辰",
        "子": "辰",
        "辰": "辰",
        "寅": "戌",
        "午": "戌",
        "戌": "戌",
        "巳": "丑",
        "酉": "丑",
        "丑": "丑",
        "亥": "未",
        "卯": "未",
        "未": "未"
    };

    return conditions[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 金舆: 
 * 甲龙乙蛇丙戊羊, 丁己猴歌庚犬方,
 * 辛猪壬牛癸逢虎, 凡人遇此福气昌.
 * 查法：以日/年干查四地支
 * @param paramString1 日干/年干
 * @param paramString2 地支
 * @return
 */
function jingyu(paramString1, paramString2) {
    const conditions = {
        "甲": "辰",
        "乙": "巳",
        "丁": "申",
        "己": "申",
        "丙": "未",
        "戊": "未",
        "庚": "戌",
        "辛": "亥",
        "壬": "丑",
        "癸": "寅"
    };

    return conditions[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 金神者，乙丑，己巳，癸酉三组干支。
 * 查法：
 * 日柱或时柱见者为是。
 * @param {*} paramString1 天干
 * @param {*} paramString2 地支
 */
function jinshen(paramString1, paramString2) {
    const combinations = new Set(["乙丑", "己巳", "癸酉"]);
    return combinations.has(paramString1 + paramString2) ? 1 : 0;
}

/**
 * 五鬼星的查法如下：
 * 子月支见辰支，丑月支见巳支，
 * 寅月支见午支，卯月支见未支，
 * 辰月支见申支，巳月支见酉支，
 * 午月支见戌支，未月支见亥支，
 * 申月支见子支，酉月支见丑支，
 * 戌月支见寅支，亥月支见卯支。
 * 即是命犯五鬼星。
 * @param {*} paramString1 月支
 * @param {*} paramString2 地支
 */
function wugui(paramString1, paramString2) {
    const conditions = {
        "子": "辰",
        "丑": "巳",
        "寅": "午",
        "卯": "未",
        "辰": "申",
        "巳": "酉",
        "午": "戌",
        "未": "亥",
        "申": "子",
        "酉": "丑",
        "戌": "寅",
        "亥": "卯"
    };

    return conditions[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 国印贵人: 
 * 甲见戌, 乙见亥, 丙见丑, 丁见寅, 戊见丑, 
 * 己见寅, 庚见辰, 辛见巳. 壬见未, 癸见申
 * 查法：以年、日干查四支
 * 
 * @param paramString1 年干/日干
 * @param paramString2 地支
 * @return
 */
function guoying(paramString1, paramString2) {
    const conditions = {
        "甲": "戌",
        "乙": "亥",
        "丙": "丑",
        "丁": "寅",
        "戊": "丑",
        "己": "寅",
        "庚": "辰",
        "辛": "巳",
        "壬": "未",
        "癸": "申"
    };

    return conditions[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 将星: 
 * 寅午戌见午, 巳酉丑见酉, 
 * 申子辰见子, 辛卯未见卯. 
 * 查法: 以年支或日支查其余各支, 见者为将星.
 *
 * @param paramString1 年支或日支
 * @param paramString2 地支
 * @return
 */
function jiangxing(paramString1, paramString2) {
    const conditions = {
        "申": ["子"],
        "子": ["子"],
        "寅": ["午"],
        "午": ["午"],
        "戌": ["午"],
        "巳": ["酉"],
        "酉": ["酉"],
        "丑": ["酉"],
        "亥": ["卯"],
        "卯": ["卯"],
        "未": ["卯"]
    };

    return conditions[paramString1]?.includes(paramString2) ? 1 : 0;
}

/**
 * 金神 金神者, 乙丑, 己巳, 癸酉三组干支. 日柱或时柱见者为是.
 *
 * @param paramString1
 * @param paramString2
 * @return
 */
function jingshen(paramString1, paramString2) {
    const validPairs = [
        ["乙", "丑"],
        ["己", "巳"],
        ["癸", "酉"]
    ];
    return validPairs.some(pair => paramString1 === pair[0] && paramString2 === pair[1]) ? 1 : 0;
}

/**
 * 孤鸾煞:
 * 甲寅日。乙巳日。丙午日。丁巳日。戊午日。戊申日。辛亥日。壬子日。 
 * 查法: 查日柱
 *
 * @param paramString1 日干
 * @param paramString2 日支
 * @return
 */
function guluan(paramString1, paramString2) {
    const validPairs = [
        ["乙", "巳"],
        ["丁", "巳"],
        ["辛", "亥"],
        ["戊", "申"],
        ["甲", "寅"],
        ["戊", "午"],
        ["壬", "子"],
        ["丙", "午"]
    ];

    for (const pair of validPairs) {
        if (paramString1 === pair[0] && paramString2 === pair[1]) {
            return 1;
        }
    }
    return 0;
}

const _nianzhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const _shangm = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
const _diaok = ["戌", "亥", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉"];
const _pim = ["酉", "戌", "亥", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申"];

/**
 * 查法：以年支查余三支
 * @param {*} paramString1 年支 
 * @param {*} paramString2 地支
 * @param {*} type 类型（"shangmen"、"diaoke"、"pima"）
 * @returns 
 */
function checkRelation(paramString1, paramString2, type) {
    const index = _nianzhi.indexOf(paramString1);
    if (index === -1) return 0;

    let targetArray;
    switch (type) {
        case "shangmen":
            targetArray = _shangm;
            break;
        case "diaoke":
            targetArray = _diaok;
            break;
        case "pima":
            targetArray = _pim;
            break;
        default:
            return 0;
    }

    return targetArray[index] === paramString2 ? 1 : 0;
}

// 封装的具体函数
function shangmen(paramString1, paramString2) {
    return checkRelation(paramString1, paramString2, "shangmen");
}

function diaoke(paramString1, paramString2) {
    return checkRelation(paramString1, paramString2, "diaoke");
}

function pima(paramString1, paramString2) {
    return checkRelation(paramString1, paramString2, "pima");
}

/**
 * 天德贵人:
 * 正月生者见丁, 二月生者见申, 三月生者见壬, 四月生者见辛, 
 * 五月生者见亥, 六月生者见甲, 七月生者见癸, 八月生者见寅, 
 * 九月生者见丙, 十月生者见乙,十一月生者见巳, 十二月生者见庚. 
 * 查法：以月支查四柱干支
 *
 * @param paramString1 月支
 * @param paramString2 干或支
 * @return
 */
function tiandeguiren(paramString1, paramString2) {
    const validPairs = {
        "寅": "丁",
        "卯": "申",
        "辰": "壬",
        "巳": "辛",
        "午": "亥",
        "未": "甲",
        "申": "癸",
        "酉": "寅",
        "戌": "丙",
        "亥": "乙",
        "子": "巳",
        "丑": "庚"
    };

    return validPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 元辰：
 * 阳男阴女：子年未。丑年申。寅年酉。卯年戌。辰年亥。巳年子。午年丑。未年寅。申年卯。酉年辰。戌年巳。亥年午。
 * 阴男阳女：子年巳。丑年午。寅年未。卯年申。辰年酉。巳年戌。午年亥。未年子。申年丑。酉年寅。戌年卯。亥年辰。
 * 查法：以年支查余三支
 * 
 * @param {*} paramString1 年支
 * @param {*} paramString2 地支
 * @param {*} isman 性别
 * @param {*} yinyang 年干阴阳
 * @returns 
 */
function yuancheng(paramString1, paramString2, isman, yinyang) {
    const validPairs = {
        true: { // 阳男阴女
            "子": "未", "丑": "申", "寅": "酉", "卯": "戌",
            "辰": "亥", "巳": "子", "午": "丑", "未": "寅",
            "申": "卯", "酉": "辰", "戌": "巳", "亥": "午"
        },
        false: { // 阴男阳女
            "子": "巳", "丑": "午", "寅": "未", "卯": "申",
            "辰": "酉", "巳": "戌", "午": "亥", "未": "子",
            "申": "丑", "酉": "寅", "戌": "卯", "亥": "辰"
        }
    };

    const isYang = isman === yinyang; // true: 阳男阴女, false: 阴男阳女
    return validPairs[isYang][paramString1] === paramString2 ? 1 : 0;
}

/**
 * 月德贵人: 
 * 寅午戌月生者见丙, 申子辰月生者见壬, 
 * 亥卯未月生者见甲,巳酉丑月生者见庚. 
 * 凡柱中年月日时干上见者为有月德贵人.
 * 查法：以月支查四柱干支
 * 
 * @param paramString1 月支
 * @param paramString2 年月日时干
 * @return
 */
function yuede(paramString1, paramString2) {
    const validPairs = {
        "寅": "丙",
        "午": "丙",
        "戌": "丙",
        "申": "壬",
        "子": "壬",
        "辰": "壬",
        "亥": "甲",
        "卯": "甲",
        "未": "甲",
        "巳": "庚",
        "酉": "庚",
        "丑": "庚"
    };

    return validPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 天赦: 
 * 春戊寅, 夏甲午, 秋戊申, 冬甲子. 
 * 查法: 寅卯辰月生戊寅日, 巳午未月生甲午日, 申酉戌月生戊申日, 亥子丑月生甲子日.
 *
 * @param paramString1 月支
 * @param paramString2 日干
 * @param paramString3 日支
 * @return
 */
function tianshe(paramString1, paramString2, paramString3) {
    const conditions = {
        "寅": paramString2 === "戊" && paramString3 === "寅",
        "卯": paramString2 === "戊" && paramString3 === "寅",
        "辰": paramString2 === "戊" && paramString3 === "寅",
        "巳": paramString2 === "甲" && paramString3 === "午",
        "午": paramString2 === "甲" && paramString3 === "午",
        "未": paramString2 === "甲" && paramString3 === "午",
        "申": paramString2 === "戊" && paramString3 === "申",
        "酉": paramString2 === "戊" && paramString3 === "申",
        "戌": paramString2 === "戊" && paramString3 === "申",
        "亥": paramString2 === "甲" && paramString3 === "子",
        "子": paramString2 === "甲" && paramString3 === "子",
        "丑": paramString2 === "甲" && paramString3 === "子"
    };

    return conditions[paramString1] ? 1 : 0;
}

/**
 * 四废 
 * 春庚申, 辛酉, 
 * 夏壬子, 癸亥, 
 * 秋甲寅, 乙卯, 
 * 冬丙午, 丁巳. 
 * 查法: 凡四柱日干支生于该季为是.
 *
 * @param paramString1 月支
 * @param paramString2 日干
 * @param paramString3 日支
 * @return
 */
function sifei(paramString1, paramString2, paramString3) {
    const conditions = {
        "寅": ["庚申", "辛酉"],
        "卯": ["庚申", "辛酉"],
        "辰": ["庚申", "辛酉"],
        "巳": ["壬子", "癸亥"],
        "午": ["壬子", "癸亥"],
        "未": ["壬子", "癸亥"],
        "申": ["甲寅", "乙卯"],
        "酉": ["甲寅", "乙卯"],
        "戌": ["甲寅", "乙卯"],
        "亥": ["丙午", "丁巳"],
        "子": ["丙午", "丁巳"],
        "丑": ["丙午", "丁巳"]
    };

    const key = paramString1 in conditions ? conditions[paramString1] : [];
    return key.includes(paramString2 + paramString3) ? 1 : 0;
}

/**
 * 天医 
 * 正月生见丑, 二月生见寅, 三月生见卯, 四月生见辰,五月生见巳, 六月生见午, 
 * 七月生见未, 八月生见申,九月生见酉, 十月生见戌, 十一月生见亥, 十二月生见子. 
 * 查法: 以月支查其它地支, 见者为是.
 *
 * @param paramString1 月支
 * @param paramString2 地支
 * @return
 */
function tianyi(paramString1, paramString2) {
    const matchPairs = {
        "寅": "丑",
        "卯": "寅",
        "辰": "卯",
        "巳": "辰",
        "午": "巳",
        "未": "午",
        "申": "未",
        "酉": "申",
        "戌": "酉",
        "亥": "戌",
        "子": "亥",
        "丑": "子"
    };

    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 禄神: 
 * 甲禄在寅, 乙禄在卯, 丙戊禄在巳, 丁己禄在午, 庚禄在申, 辛禄在酉, 壬禄在亥, 癸禄在子. 
 * 查法: 以日干查四支, 见之者为是.
 *
 * @param paramString1 日干
 * @param paramString2 地支
 * @return
 */
function lushen(paramString1, paramString2) {
    const matchPairs = {
        "甲": "寅",
        "乙": "卯",
        "丙": "巳",
        "丁": "午",
        "戊": "巳",
        "己": "午",
        "庚": "申",
        "辛": "酉",
        "壬": "亥",
        "癸": "子"
    };

    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 红鸾： 
 * 红鸾年支: 
 *  子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥 
 * 其他地支见: 
 *  卯 寅 丑 子 亥 戌 酉 申 未 午 巳 辰
 * 查法：以年支查余地支。如子年生人见卯为红鸾，见酉为天喜。
 * @param paramString1 年支
 * @param paramString2 地支
 * @return
 */
function hongluan(paramString1, paramString2) {
    const matchPairs = {
        "子": "卯",
        "丑": "寅",
        "寅": "丑",
        "卯": "子",
        "辰": "亥",
        "巳": "戌",
        "午": "酉",
        "未": "申",
        "申": "未",
        "酉": "午",
        "戌": "巳",
        "亥": "辰"
    };

    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 天喜: 
 * 天喜年支: 
 *  子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥 
 * 其他地支见: 
 *  酉 申 未 午 巳 辰 卯 寅 丑 子 亥 戌
 *
 * @param paramString1 年支
 * @param paramString2 地支
 * @return
 */
function tianxi(paramString1, paramString2) {
    const matchPairs = {
        "子": "酉",
        "丑": "申",
        "寅": "未",
        "卯": "午",
        "辰": "巳",
        "巳": "辰",
        "午": "卯",
        "未": "寅",
        "申": "丑",
        "酉": "子",
        "戌": "亥",
        "亥": "戌"
    };

    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 天罗:  
 * 查法一：以年支/日支查余三支
 * 戌亥为天罗，辰巳为地网；
 * 戌见亥, 亥见戌为天罗；辰见巳, 巳见辰为地网。
 * 查法二：以年纳音查日支
 * 火命人逢戌亥为天罗, 水土命逢辰巳为地网. 
 * 采用查法一。
 * @param paramString1 年支/日支
 * @param paramString2 地支
 * @return
 */
function tianluo(paramString1, paramString2) {
    return (paramString1 === "戌" && paramString2 === "亥") || 
        (paramString1 === "亥" && paramString2 === "戌") ? 1 : 0;
}

/**
 * 地网:  
 * 查法一：以年支/日支查余三支
 * 戌亥为天罗，辰巳为地网；
 * 戌见亥, 亥见戌为天罗；辰见巳, 巳见辰为地网。
 * 查法二：以年纳音查日支
 * 火命人逢戌亥为天罗, 水土命逢辰巳为地网. 
 *
 * @param paramString1 年支/日支
 * @param paramString2 地支
 * @return
 */
function diwang(paramString1, paramString2) {
    return (paramString1 === "辰" && paramString2 === "巳") || 
        (paramString1 === "巳" && paramString2 === "辰") ? 1 : 0;
}

/**
 * 羊刃:
 *  甲羊刃在卯, 乙羊刃在寅, 
 *  丙戊羊刃在午, 丁己羊刃在巳, 
 *  庚羊刃在酉, 辛羊刃在申, 
 *  壬羊刃在子, 癸羊刃在亥.
 * 查法: 以日干为主, 四支见之者为是.
 *
 * @param paramString1 日干
 * @param paramString2 地支
 * @return
 */
function yangren(paramString1, paramString2) {
    const matchPairs = {
        "甲": "卯",
        "乙": "寅",
        "丙": "午",
        "丁": "巳",
        "戊": "午",
        "己": "巳",
        "庚": "酉",
        "辛": "申",
        "壬": "子",
        "癸": "亥"
    };

    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 羊刃:
 * 甲羊刃在卯，如果地支见酉，即为飞刃；
 * 乙刃在寅，寅申相冲，即为飞刃；
 * 丙戊羊刃在午，地支见子，即为飞刃；
 * 丁己羊刃在未，地支见丑，即为飞刃；
 * 庚羊刃在酉，地支见卯，即为飞刃；
 * 辛羊刃在戌， 地支见辰，即为羊刃；
 * 壬羊刃在子，地支见午，即为飞刃；
 * 癸羊刃在丑，地支见未，即为飞刃。
 * 查法: 以日干查四地支，羊刃的六冲
 *
 * @param paramString1 日干
 * @param paramString2 地支
 * @return
 */
function feiren(paramString1, paramString2) {
    const matchPairs = {
        "甲": "酉",
        "乙": "申",
        "丙": "子",
        "戊": "子",
        "丁": "丑",
        "己": "丑",
        "庚": "卯",
        "辛": "辰",
        "壬": "午",
        "癸": "未"
    };

    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 劫煞:
 *  申子辰见巳, 亥卯未见申, 
 *  寅午戌见亥, 巳酉丑见寅. 
 * 查法: 以年柱或日柱为主, 四柱地支见之者为是.
 *
 * @param paramString1 年支/日支
 * @param paramString2 地支
 * @return
 */
function jiesha(paramString1, paramString2) {
    const matchGroups = {
        "亥": ["寅", "午", "戌"],
        "巳": ["申", "子", "辰"],
        "寅": ["巳", "酉", "丑"],
        "申": ["亥", "卯", "未"]
    };

    return matchGroups[paramString2] && matchGroups[paramString2].includes(paramString1) ? 1 : 0;
}

/**
 * 灾煞:
 *  申子辰见午, 亥卯未见酉, 
 *  寅午戌见子, 巳酉丑见卯. 
 * 查法: 以年支为主, 四柱地支中见之者为是.
 *
 * @param paramString1 年支
 * @param paramString2 地支
 * @return
 */
function zaisha(paramString1, paramString2) {
    const matchGroups = {
        "午": ["申", "子", "辰"],
        "子": ["寅", "午", "戌"],
        "卯": ["巳", "酉", "丑"],
        "酉": ["亥", "卯", "未"]
    };

    return matchGroups[paramString2] && matchGroups[paramString2].includes(paramString1) ? 1 : 0;
}

/**
 * 孤辰:
 *  亥子丑人, 见寅为孤, 见戌为寡. 
 *  寅卯辰人, 见巳为孤, 见丑为寡.
 *  巳午未人, 见申为孤, 见辰为寡.
 *  申酉戌人, 见亥为孤, 见未为寡. 
 *  查法: 以年支为准, 四柱其它地支见者为是. 如巳年生人, 见申为孤辰, 见辰为寡宿.
 *
 * @param paramString1 年支
 * @param paramString2 地支 
 * @return
 */
function gucheng(paramString1, paramString2) {
    const matchGroups = {
        "寅": ["亥", "子", "丑"],
        "巳": ["寅", "卯", "辰"],
        "申": ["巳", "午", "未"],
        "亥": ["申", "酉", "戌"]
    };

    return matchGroups[paramString2] && matchGroups[paramString2].includes(paramString1) ? 1 : 0;
}

/**
 * 寡宿:
 *  亥子丑人, 见寅为孤, 见戌为寡. 
 *  寅卯辰人, 见巳为孤, 见丑为寡.
 *  巳午未人, 见申为孤, 见辰为寡.
 *  申酉戌人, 见亥为孤, 见未为寡. 
 *  查法: 以年支为准, 四柱其它地支见者为是. 如巳年生人, 见申为孤辰, 见辰为寡宿.
 *
 * @param paramString1 年支
 * @param paramString2 地支 
 * @return
 */
function guashu(paramString1, paramString2) {
    const matchGroups = {
        "戌": ["亥", "子", "丑"],
        "丑": ["寅", "卯", "辰"],
        "辰": ["巳", "午", "未"],
        "未": ["申", "酉", "戌"]
    };

    return matchGroups[paramString2] && matchGroups[paramString2].includes(paramString1) ? 1 : 0;
}

/**
 * 亡神:
 * 寅午戌见巳, 亥卯未见寅, 
 * 巳酉丑见申, 申子辰见亥. 
 * 查法: 以年\日支查余三支.
 *
 * @param paramString1 年支/日支
 * @param paramString2 地支
 * @return
 */
function wangshen(paramString1, paramString2) {
    const matchGroups = {
        "亥": ["申", "子", "辰"],
        "巳": ["寅", "午", "戌"],
        "申": ["巳", "酉", "丑"],
        "寅": ["亥", "卯", "未"]
    };

    return matchGroups[paramString2] && matchGroups[paramString2].includes(paramString1) ? 1 : 0;
}

/**
 * 十恶大败:
 * 甲辰乙巳与壬申, 丙申丁亥及庚辰, 
 * 戊戌癸亥加辛巳, 己丑都来十位神. 
 * 查法: 四柱日柱逢之即是.
 *
 * @param paramString1 rigan
 * @param paramString2 rizhi
 * @return
 */
function shiedabai(paramString1, paramString2) {
    const matchPairs = {
        "甲": "辰",
        "乙": "巳",
        "壬": "申",
        "丙": "申",
        "丁": "亥",
        "庚": "辰",
        "戊": "戌",
        "癸": "亥",
        "辛": "巳",
        "己": "丑"
    };

    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 词馆 
 * 年柱纳音为金命见其他三支有“申”为学堂，见“壬申”为正学堂（海中金、剑锋金、沙中金都为纳音金命）；
 * 年柱纳音为木命见其他三支有“寅”为学堂，见“庚寅”为正学堂；
 * 年柱纳音为水命见其他三支有“亥”为学堂，见“癸亥”为正学堂；
 * 年柱纳音为土命见其他三支有“亥”为学堂，见“丁亥”为正学堂；
 * 年柱纳音为火命见其他三支有“巳”为学堂，见“乙巳”为正学堂。
 * 
 * @param paramString1 年柱纳音
 * @param paramString2 天干
 * @param paramString3 地支
 * @return
 */
function ciguan(paramString1, paramString2, paramString3) {
    const nywx = paramString1.substring(2);
    const matchConditions = {
        "金": ["申", ["壬", "卯"]],
        "木": ["寅", ["庚", "寅"]],
        "水": ["亥", ["癸", "亥"]],
        "土": ["亥", ["丁", "亥"]],
        "火": ["巳", ["乙", "巳"]]
    };

    if (matchConditions[nywx]) {
        const [mainMatch, subMatch] = matchConditions[nywx];
        if (paramString3 === mainMatch || (Array.isArray(subMatch) && subMatch[0] === paramString2 && paramString3 === subMatch[1])) {
            return 1;
        }
    }
    return 0;
}

/**
 * 学堂
 * 年柱纳音为金命见其他三支有“巳”为学堂，见“辛巳”为正学堂（海中金、剑锋金、沙中金都为纳音金命）；
 * 年柱纳音为木命见其他三支有“亥”为学堂，见“己亥”为正学堂；
 * 年柱纳音为水命见其他三支有“申”为学堂，见“甲申”为正学堂；
 * 年柱纳音为土命见其他三支有“申”为学堂，见“戊申”为正学堂；
 * 年柱纳音为火命见其他三支有“寅”为学堂，见“丙寅”为正学堂。
 * 
 * @param paramString1 年柱纳音
 * @param paramString2 天干
 * @param paramString3 地支
 * @return
 */
function xuetang(paramString1, paramString2, paramString3) {
    const nywx = paramString1.substring(2);
    const matchConditions = {
        "金": ["巳", ["辛", "巳"]],
        "木": ["亥", ["己", "亥"]],
        "水": ["申", ["甲", "申"]],
        "土": ["申", ["戊", "申"]],
        "火": ["寅", ["丙", "寅"]]
    };

    if (matchConditions[nywx]) {
        const [mainMatch, subMatch] = matchConditions[nywx];
        if (paramString3 === mainMatch || (Array.isArray(subMatch) && subMatch[0] === paramString2 && paramString3 === subMatch[1])) {
            return 1;
        }
    }
    return 0;
}

/**
 * 血刃
 * 寅月丑。卯月未。辰月寅。巳月申。午月卯。未月酉。
 * 申月辰。酉月戌。戌月巳。亥月亥。子月午。丑月子。
 * 查法：以月支查四柱干支
 * @param paramString1 月支
 * @param paramString2 地支
 */
function xueren(paramString1, paramString2) {
    const matchPairs = {
        "子": "午",
        "丑": "子",
        "寅": "丑",
        "卯": "未",
        "辰": "寅",
        "巳": "申",
        "午": "卯",
        "未": "酉",
        "申": "辰",
        "酉": "戌",
        "戌": "巳",
        "亥": "亥"
    };
    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 十灵日。
 * 古诀：
 * “男带十灵好文章，女带十灵好衣裳。”
 * 甲辰、乙亥、丙辰、丁酉、戊午、庚戌、庚寅、辛亥、壬寅、癸未
 * 查法：查日柱
 * @param {*} paramString1 日干
 * @param {*} paramString2 日支
 */
function shiling(paramString1, paramString2) {
    const matchSet = new Set([
        "甲辰", "乙亥", "丙辰", "丁酉", 
        "戊午", "庚戌", "庚寅", "辛亥", 
        "壬寅", "癸未"
    ]);

    return matchSet.has(paramString1 + paramString2) ? 1 : 0;
}

/**
 * 流霞
 * 甲日酉。乙日戌。丙日未。丁日申。戊日巳。
 * 己日午。庚日辰。辛日卯。壬日亥。癸日寅。
 * 查法：以日干查四地支
 * @param paramString1 日干
 * @param paramString2 地支
 */
function liuxia(paramString1, paramString2) {
    const matchSet = new Set([
        "甲酉", "乙戌", "丙未", "丁申", 
        "戊巳", "己午", "庚辰", "辛卯", 
        "壬亥", "癸寅"
    ]);

    return matchSet.has(paramString1 + paramString2) ? 1 : 0;
}

/**
 * 甲日午。乙日午。丙日寅。丁日未。戊日辰。
 * 己日辰。庚日戌。辛日酉。壬日子。癸日申。
 * 查法：以日干查四地支
 * @param paramString1 日干
 * @param paramString2 地支
 */
function hongyan(paramString1, paramString2) {
    const matchSet = new Set([
        "甲午", "乙午", "丙寅", "丁未", 
        "戊辰", "己辰", "庚戌", "辛酉", 
        "壬子", "癸申"
    ]);

    return matchSet.has(paramString1 + paramString2) ? 1 : 0;
}

/**
 * 春秋寅子贵，冬夏卯未辰；
 * 金木马卯合，水火鸡犬多；
 * 土命逢辰巳，童子定不错。
 * 查法：
 * 1、命造生在春季或秋季的（以月令算），日支或时支见寅或子的。
 * 2、命造生在冬季或夏季的（以月令算），日支或时支见卯、未或辰的。
 * 3、年柱纳音为金或木的，日支或时支见午或卯的。
 * 4、年柱纳音为水或火的，日支或时支见酉或戌的。
 * 5、年柱纳音为土命的，日支或时支见辰或巳的。
 * 
 * @param paramString1 月支
 * @param paramString2 年柱纳音
 * @param paramString3 日支或时支
 */
function tongzi(paramString1, paramString2, paramString3) {
    const firstConditions = {
        "寅": ["寅", "子"],
        "卯": ["寅", "子"],
        "辰": ["寅", "子"],
        "申": ["寅", "子"],
        "酉": ["寅", "子"],
        "戌": ["寅", "子"],
        "巳": ["卯", "未", "辰"],
        "午": ["卯", "未", "辰"],
        "未": ["卯", "未", "辰"],
        "亥": ["卯", "未", "辰"],
        "子": ["卯", "未", "辰"],
        "丑": ["卯", "未", "辰"],
    };

    if (firstConditions[paramString1] && firstConditions[paramString1].includes(paramString3)) {
        return 1;
    }

    const element = paramString2.split("")[2];

    const secondConditions = {
        "金": ["午", "卯"],
        "木": ["午", "卯"],
        "水": ["酉", "戌"],
        "火": ["酉", "戌"],
        "土": ["辰", "巳"],
    };

    if (secondConditions[element] && secondConditions[element].includes(paramString3)) {
        return 1;
    }

    return 0;
}

/**
 * 福星。
 * 凡甲、丙两干见寅或子，乙、癸两干见卯或丑，戊干见申，己干见未，丁干见亥，庚干见午，辛干见巳，壬干见辰是也。
 * 查法: 以年/日干查地支
 * @param paramString1 年干/日干
 * @param paramString2 地支
 */
function fuxing(paramString1, paramString2) {
    const conditions = [
        { gan: ["甲", "丙"], zhi: ["寅", "子"] },
        { gan: ["乙", "癸"], zhi: ["卯", "丑"] },
        { gan: ["戊"], zhi: ["申"] },
        { gan: ["己"], zhi: ["未"] },
        { gan: ["丁"], zhi: ["亥"] },
        { gan: ["庚"], zhi: ["午"] },
        { gan: ["辛"], zhi: ["巳"] },
        { gan: ["壬"], zhi: ["辰"] },
    ];

    for (const { gan, zhi } of conditions) {
        if (gan.includes(paramString1) && zhi.includes(paramString2)) {
            return 1;
        }
    }

    return 0;
}

/**
 * 天德合。
 * 寅月壬。卯月巳。辰月丁。巳月丙。午月寅。未月己。
 * 申月戊。酉月亥。戌月辛。亥月庚。子月申。丑月乙。
 * 查法：以月支查其它干/支
 * @param paramString1 月支
 * @param paramString2 天干或地支
 */
function tiandehe(paramString1, paramString2) {
    const matchPairs = {
        "寅": "壬",
        "卯": "巳",
        "辰": "丁",
        "巳": "丙",
        "午": "寅",
        "未": "己",
        "申": "戊",
        "酉": "亥",
        "戌": "辛",
        "亥": "庚",
        "子": "申",
        "丑": "乙"
    };

    return matchPairs[paramString1] === paramString2 ? 1 : 0;
}

/**
 * 月德合.
 * 寅午戌月见辛，申子辰月见丁，巳酉丑月见乙，亥卯未月见己。
 * 查法：以月支查天干
 * @param paramString1 月支
 * @param paramString2 天干
 */
function yuedehe(paramString1, paramString2) {
    const matchGroups = {
        "辛": ["寅", "午", "戌"],
        "丁": ["申", "子", "辰"],
        "乙": ["巳", "酉", "丑"],
        "己": ["亥", "卯", "未"]
    };

    return matchGroups[paramString2] && matchGroups[paramString2].includes(paramString1) ? 1 : 0;
}

/**
 * 九丑
 * 丁酉日。戊子日。戊午日。己卯日。己酉日。辛卯日。辛酉日。壬子日。壬午日。
 * 查法：查日柱
 * 此煞名“丑”，不是指容貌不好看，相反的，此日生者大多容貌美丽，或很有吸引人的魅力。其所以名“丑”，
 * 是指名声方面的风评，因感情的事容易出问题，严重的可能会惹上法律纠纷，名声受损。
 * @param paramString1 日干
 * @param paramString2 日支
 */
function jiuchou(paramString1, paramString2){
    var arr = ["丁酉","戊子","戊午","己卯","己酉","辛卯","辛酉","壬子","壬午"];
    var rizhu = paramString1 + paramString2;
    if(  arr.indexOf(rizhu)!=-1 ) return 1;
    else return 0;
}

/**
 * 古决
 * 甲寅日。乙卯日。丁未日。戊戌日。己未日。庚申日。辛酉日。癸丑日。
 * 查法: 查日柱
 * 此日柱，大抵天干坐禄或冠带，通常是身体比较好的人，生理欲望强，容易因酒、色而招来困扰、失败。
 * @param paramString1 日干
 * @param paramString2 日支
 */
function bazhuan(paramString1, paramString2){
    var arr = ["甲寅","乙卯","丁未","戊戌","己未","庚申","辛酉","癸丑"];
    var rizhu = paramString1 + paramString2;
    if(  arr.indexOf(rizhu)!=-1 ) return 1;
    else return 0;
}


/**
 * 算年柱在60甲子顺序，注意顺序1-60
 *
 * @param yearganzhi 年柱干支
 * @return 年柱在60甲子顺序。
 */
function getJiaziOrder(yearganzhi) {
    var idx = JIAZI.indexOf(yearganzhi);
    return idx;
}

/**
 * 天干阴阳
 * @param {} tiangan 
 * @returns 返回true｜false
 */
function tianganYinyang(tiangan) {
	if ((tiangan==("甲")) || (tiangan==("丙")) || (tiangan==("戊"))
			|| (tiangan==("庚")) || (tiangan==("壬"))) {
		return true;
	}
	if ((tiangan==("乙")) || (tiangan==("丁")) || (tiangan==("己"))
			|| (tiangan==("辛")) || (tiangan==("癸"))) {
		return false;
	}
	return false;
}

/**
 * 查询地支五行。
 */
function dizhiWuxing(dizhi) {
    const wuxingMapping = {
        "寅": "木",
        "卯": "木",
        "巳": "火",
        "午": "火",
        "丑": "土",
        "辰": "土",
        "未": "土",
        "戌": "土",
        "申": "金",
        "酉": "金",
        "亥": "水",
        "子": "水"
    };

    return wuxingMapping[dizhi] || "";
}
