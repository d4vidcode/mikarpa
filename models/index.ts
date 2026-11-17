/**
 * Barrel de modelos. Importar SOLO desde código de servidor
 * (Server Components, Route Handlers, Server Actions, scripts).
 * Nunca desde Client Components: arrastra mongoose al bundle.
 */
export { AuditLog } from './AuditLog';
export { Category } from './Category';
export { Counter } from './Counter';
export { Order } from './Order';
export { PaymentAccount } from './PaymentAccount';
export { Product } from './Product';
export { PlatformSettings } from './Settings';
export { Store } from './Store';
export { StoreCategory } from './StoreCategory';
export { StoreMember } from './StoreMember';
export { Theme } from './Theme';
export { User } from './User';

export type { AuditLogDocument } from './AuditLog';
export type { CategoryDocument } from './Category';
export type { CounterDocument } from './Counter';
export type { OrderDocument } from './Order';
export type { PaymentAccountDocument } from './PaymentAccount';
export type { ProductDocument } from './Product';
export type { PlatformSettingsDocument } from './Settings';
export type { StoreDocument } from './Store';
export type { StoreCategoryDocument } from './StoreCategory';
export type { StoreMemberDocument } from './StoreMember';
export type { ThemeDocument } from './Theme';
export type { UserDocument } from './User';
