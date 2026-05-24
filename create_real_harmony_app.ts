import * as fs from 'fs';
import * as path from 'path';

const projectDir = './real-harmony-app';
const srcDir = path.join(projectDir, 'src');

if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true });
}
fs.mkdirSync(srcDir, { recursive: true });

console.log('🚀 第八轮：创建真实鸿蒙应用项目');
console.log('=============================================================');

// Entry 页面
const entryPage = `// Entry页面 - 应用启动入口
import { CommonConstants } from '../constants/CommonConstants';
import { HomePage } from '../pages/HomePage';

@Entry
@Component
struct Index {
  @State title: string = CommonConstants.APP_NAME;
  
  build() {
    Column() {
      HomePage();
    }
    .width('100%')
    .height('100%')
    .backgroundColor($r('sys.color.ohos_id_color_background'));
  }
}`;

// Home页面
const homePage = `// 首页 - 主页面
import { ProductComponent } from '../components/ProductComponent';
import { CategoryService } from '../services/CategoryService';
import { ProductModel } from '../models/ProductModel';

@Component
export struct HomePage {
  @State products: ProductModel[] = [];
  @State isLoading: boolean = false;
  
  aboutToAppear() {
    this.loadProducts();
  }
  
  async loadProducts() {
    this.isLoading = true;
    try {
      const service = CategoryService.getInstance();
      this.products = await service.getFeaturedProducts();
    } catch (e) {
      console.error('加载失败:', JSON.stringify(e));
    } finally {
      this.isLoading = false;
    }
  }
  
  build() {
    Scroll() {
      Column() {
        Text('热门商品')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 16, left: 16, top: 16 });
        
        if (this.isLoading) {
          LoadingProgress().width(50).height(50);
        } else {
          Grid() {
            ForEach(this.products, (product: ProductModel) => {
              GridItem() {
                ProductComponent({ product });
              }
            }, (product: ProductModel) => product.id);
          }
          .columnsTemplate('1fr 1fr')
          .gap(16);
        }
      }
    }
    .backgroundColor('#F5F5F5');
  }
}`;

// 产品组件
const productComponent = `// 产品组件
import { ProductModel } from '../models/ProductModel';

@Component
export struct ProductComponent {
  @Prop product: ProductModel;
  
  build() {
    Column() {
      Image(this.product.imageUrl)
        .width('100%')
        .height(150)
        .objectFit(ImageFit.Cover);
      
      Text(this.product.name)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin({ top: 8 });
      
      Text('¥' + this.product.price.toFixed(2))
        .fontSize(18)
        .fontColor('#FF0000')
        .fontWeight(FontWeight.Bold)
        .margin({ top: 4 });
    }
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
    .padding(8)
    .shadow({ radius: 4, color: 'rgba(0,0,0,0.1)' });
  }
}`;

// 产品模型
const productModel = `// 产品数据模型
export class ProductModel {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  
  constructor(id: number, name: string, description: string, price: number, imageUrl: string, categoryId: number) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.categoryId = categoryId;
  }
  
  getDiscountedPrice(discountPercentage: number): number {
    return this.price * (1 - discountPercentage / 100);
  }
}`;

// 订单模型
const orderModel = `// 订单数据模型
import { ProductModel } from './ProductModel';

export class OrderModel {
  id: number;
  userId: number;
  items: OrderItemModel[];
  totalAmount: number;
  status: string;
  createdAt: Date;
  
  constructor(id: number, userId: number, items: OrderItemModel[]) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.totalAmount = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    this.status = 'CREATED';
    this.createdAt = new Date();
  }
}

export class OrderItemModel {
  product: ProductModel;
  quantity: number;
  
  constructor(product: ProductModel, quantity: number) {
    this.product = product;
    this.quantity = quantity;
  }
}`;

// 用户模型
const userModel = `// 用户数据模型
export class UserModel {
  id: number;
  username: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  isVip: boolean;
  
  constructor(id: number, username: string, email: string) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.phone = '';
    this.address = '';
    this.avatar = '';
    this.isVip = false;
  }
  
  getGreeting(): string {
    return '你好，' + this.username;
  }
}`;

// 分类服务
const categoryService = `// 分类服务
import { ProductModel } from '../models/ProductModel';

export class CategoryService {
  private static instance: CategoryService;
  private products: ProductModel[] = [];
  
  private constructor() {
    this.initSampleProducts();
  }
  
  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }
  
  private initSampleProducts() {
    this.products = [
      new ProductModel(1, '智能手机', '高性能手机', 2999, '/images/phone.jpg', 1),
      new ProductModel(2, '蓝牙耳机', '无线蓝牙音乐耳机', 199, '/images/headphone.jpg', 2),
      new ProductModel(3, '笔记本电脑', '轻薄商务本', 5999, '/images/laptop.jpg', 1),
      new ProductModel(4, '智能手表', '多功能运动手表', 899, '/images/watch.jpg', 3),
    ];
  }
  
  async getFeaturedProducts(): Promise<ProductModel[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.products.slice(0, 4));
      }, 500);
    });
  }
  
  async getAllCategories(): Promise<string[]> {
    return ['电子产品', '服装', '食品', '家居'];
  }
}`;

// 购物车服务
const cartService = `// 购物车服务
import { ProductModel } from '../models/ProductModel';

export class CartService {
  private items: { product: ProductModel; quantity: number }[] = [];
  private static instance: CartService;
  
  private constructor() {}
  
  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }
  
  addItem(product: ProductModel, quantity: number): void {
    const existingItem = this.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  }
  
  removeItem(productId: number): void {
    this.items = this.items.filter(item => item.product.id !== productId);
  }
  
  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  }
  
  clearCart(): void {
    this.items = [];
  }
  
  getItems(): { product: ProductModel; quantity: number }[] {
    return [...this.items];
  }
}`;

// 常量
const constants = `// 应用常量
export class CommonConstants {
  static readonly APP_NAME = '鸿蒙商城';
  static readonly VERSION = '1.0.0';
  static readonly API_BASE_URL = 'https://api.example.com';
  static readonly DEFAULT_PAGE_SIZE = 20;
  static readonly MAX_PRODUCT_NAME_LENGTH = 50;
}`;

// 工具类
const utils = `// 通用工具类
export class StringUtils {
  static isEmpty(str: string | null | undefined): boolean {
    return str == null || str.trim() === '';
  }
  
  static truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength - 3) + '...';
  }
  
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export class NumberUtils {
  static formatPrice(price: number): string {
    return '¥' + price.toFixed(2);
  }
  
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}`;

// 创建文件
const dirs = [
  'entry', 'pages', 'components', 'models', 
  'services', 'utils', 'constants'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(srcDir, dir), { recursive: true });
});

fs.writeFileSync(path.join(srcDir, 'entry', 'Index.ets'), entryPage);
fs.writeFileSync(path.join(srcDir, 'pages', 'HomePage.ets'), homePage);
fs.writeFileSync(path.join(srcDir, 'components', 'ProductComponent.ets'), productComponent);
fs.writeFileSync(path.join(srcDir, 'models', 'ProductModel.ets'), productModel);
fs.writeFileSync(path.join(srcDir, 'models', 'OrderModel.ets'), orderModel);
fs.writeFileSync(path.join(srcDir, 'models', 'UserModel.ets'), userModel);
fs.writeFileSync(path.join(srcDir, 'services', 'CategoryService.ets'), categoryService);
fs.writeFileSync(path.join(srcDir, 'services', 'CartService.ets'), cartService);
fs.writeFileSync(path.join(srcDir, 'constants', 'CommonConstants.ets'), constants);
fs.writeFileSync(path.join(srcDir, 'utils', 'Utils.ets'), utils);

console.log('✅ 真实鸿蒙应用项目创建完成！');
console.log('📦 文件结构：');
console.log('  - entry/Index.ets');
console.log('  - pages/HomePage.ets');
console.log('  - components/ProductComponent.ets');
console.log('  - models/ProductModel.ets');
console.log('  - models/OrderModel.ets');
console.log('  - models/UserModel.ets');
console.log('  - services/CategoryService.ets');
console.log('  - services/CartService.ets');
console.log('  - constants/CommonConstants.ets');
console.log('  - utils/Utils.ets');
console.log('=============================================================');
