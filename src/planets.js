// 行星数据配置
// distance: 轨道半径（场景单位）
// size: 球体半径
// speed: 公转角速度倍数
// rotationSpeed: 自转速度倍数
// color: 基础颜色（十六进制）

export const SUN = {
  name: '太阳',
  size: 16,
  color: 0xFFD060,
  emissive: 0xFF6600,
  details: {
    type: '恒星 G 型主序星',
    diameter: '1,392,700 km',
    mass: '1.989 × 10³⁰ kg',
    surfaceTemp: '约 5,500°C',
    coreTemp: '约 15,000,000°C',
    age: '约 46 亿年',
    description: '太阳是太阳系的中心天体，占太阳系总质量的 99.86%。它通过核聚变将氢转化为氦，每秒释放约 3.8×10²⁶ 瓦特的能量。'
  }
};

// 尺寸说明（相对地球 = 2.0 为基准，Sun = 16 ≈ 8× 地球）：
// 类地行星按 ×2 放大以保证可见；气态巨行星按 ×0.5 压缩以不超过太阳。
// 轨道距离已同步扩大，确保内行星不与太阳（半径16）重叠。

export const PLANETS = [
  {
    name: '水星',
    distance: 24,
    size: 0.8,
    color: 0x9A9A9A,   // 岩石中灰
    emissive: 0x2A2A2A,
    inclination: 7.0,
    speed: 4.74,
    rotationSpeed: 0.017,
    details: {
      type: '类地行星',
      diameter: '4,879 km',
      mass: '3.30 × 10²³ kg',
      orbitalPeriod: '88 天',
      dayLength: '58.6 地球日',
      surfaceTemp: '-180°C ~ 430°C',
      moons: '0 颗',
      description: '水星是太阳系最小的行星，也是最靠近太阳的行星。它没有大气层，昼夜温差极大。'
    }
  },
  {
    name: '金星',
    distance: 30,
    size: 1.9,
    color: 0xF2E2A0,   // 硫磺云层奶黄
    emissive: 0x7A5A10,
    inclination: 3.4,
    speed: 3.50,
    rotationSpeed: -0.004, // 逆向自转
    details: {
      type: '类地行星',
      diameter: '12,104 km',
      mass: '4.87 × 10²⁴ kg',
      orbitalPeriod: '225 天',
      dayLength: '243 地球日（逆向自转）',
      surfaceTemp: '约 465°C',
      moons: '0 颗',
      description: '金星是太阳系中最热的行星，浓厚的二氧化碳大气层产生强烈的温室效应。它的自转方向与大多数行星相反。'
    }
  },
  {
    name: '地球',
    distance: 38,
    size: 2.0,
    color: 0x1A7FCC,   // 海洋蓝（主色）
    emissive: 0x0A3060,
    inclination: 0.0,
    speed: 2.98,
    rotationSpeed: 0.1,
    details: {
      type: '类地行星',
      diameter: '12,742 km',
      mass: '5.97 × 10²⁴ kg',
      orbitalPeriod: '365.25 天',
      dayLength: '24 小时',
      surfaceTemp: '-88°C ~ 58°C（平均 15°C）',
      moons: '1 颗（月球）',
      description: '地球是目前已知唯一存在生命的星球，拥有液态水、适宜的温度和保护性磁场。约 71% 的表面被海洋覆盖。'
    }
  },
  {
    name: '火星',
    distance: 47,
    size: 1.1,
    color: 0xC1440E,   // 氧化铁铁锈红橙
    emissive: 0x5A1500,
    inclination: 1.9,
    speed: 2.41,
    rotationSpeed: 0.097,
    details: {
      type: '类地行星',
      diameter: '6,779 km',
      mass: '6.42 × 10²³ kg',
      orbitalPeriod: '687 天',
      dayLength: '24 小时 37 分钟',
      surfaceTemp: '-125°C ~ 20°C',
      moons: '2 颗（火卫一、火卫二）',
      description: '火星被称为"红色星球"，因表面富含氧化铁而呈红色。拥有太阳系最高的火山——奥林帕斯山（约 21 km 高）。'
    }
  },
  {
    name: '木星',
    distance: 64,
    size: 5.5,
    color: 0xC27A3A,   // 橙棕云带
    emissive: 0x5C2A08,
    inclination: 1.3,
    speed: 1.31,
    rotationSpeed: 0.24,
    details: {
      type: '气态巨行星',
      diameter: '139,820 km',
      mass: '1.90 × 10²⁷ kg',
      orbitalPeriod: '11.86 年',
      dayLength: '9 小时 56 分钟',
      surfaceTemp: '约 -110°C（云顶）',
      moons: '95 颗（已知）',
      description: '木星是太阳系最大的行星，质量是其他所有行星总和的 2.5 倍。著名的大红斑是一场持续数百年的超级风暴。'
    }
  },
  {
    name: '土星',
    distance: 84,
    size: 4.7,
    color: 0xE8C882,   // 稻草金黄
    emissive: 0x7A5800,
    inclination: 2.5,
    speed: 0.97,
    rotationSpeed: 0.22,
    hasRings: true,
    details: {
      type: '气态巨行星',
      diameter: '116,460 km',
      mass: '5.68 × 10²⁶ kg',
      orbitalPeriod: '29.46 年',
      dayLength: '10 小时 42 分钟',
      surfaceTemp: '约 -140°C（云顶）',
      moons: '146 颗（已知）',
      description: '土星以其壮观的光环系统著称，光环主要由冰块和岩石碎片组成，宽达数十万千米但厚度不足 1 km。密度比水还低。'
    }
  },
  {
    name: '天王星',
    distance: 104,
    size: 3.5,
    color: 0x7ADFD4,   // 淡青绿（甲烷大气）
    emissive: 0x006655,
    inclination: 0.8,
    speed: 0.68,
    rotationSpeed: -0.15, // 几乎躺着自转
    details: {
      type: '冰巨行星',
      diameter: '50,724 km',
      mass: '8.68 × 10²⁵ kg',
      orbitalPeriod: '84 年',
      dayLength: '17 小时 14 分钟',
      surfaceTemp: '约 -195°C',
      moons: '28 颗（已知）',
      description: '天王星的自转轴倾斜约 98°，几乎是"躺着"公转的。它是冰巨行星，内部主要由水、氨和甲烷组成。'
    }
  },
  {
    name: '海王星',
    distance: 124,
    size: 3.4,
    color: 0x2255C8,   // 钴蓝（甲烷吸收红光）
    emissive: 0x001066,
    inclination: 1.8,
    speed: 0.54,
    rotationSpeed: 0.16,
    details: {
      type: '冰巨行星',
      diameter: '49,244 km',
      mass: '1.02 × 10²⁶ kg',
      orbitalPeriod: '164.8 年',
      dayLength: '16 小时 6 分钟',
      surfaceTemp: '约 -200°C',
      moons: '16 颗（已知）',
      description: '海王星是太阳系最远的行星，拥有太阳系最强的风速（可达 2,100 km/h）。其蓝色源于大气中的甲烷吸收红光。'
    }
  }
];
