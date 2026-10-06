import type { Factory } from './base';
import vanDeCoBan from './a1-van-de-co-ban';
import cayVaRung from './a1-cay-va-rung';
import keSach from './a2-ke-sach';
import vanDong from './b3-van-dong';
import tamGuong from './b3-tam-guong';
import lienHe from './b4-lien-he';
import nhanQua from './b4-nhan-qua';
import tatNhien from './b4-tat-nhien';
import luongChat from './b4-luong-chat';
import conDuong from './b5-con-duong';
import banhRang from './c6-banh-rang';
import tinhThe from './c8-tinh-the';
import bayCot from './c9-bay-cot';

/** 13 hiện vật 🎛 (SRS FR-14) theo mã trong exhibits.ts. */
export const INTERACTIVES: Record<string, Factory> = {
  'a1-van-de-co-ban': vanDeCoBan,
  'a1-cay-va-rung': cayVaRung,
  'a2-ke-sach': keSach,
  'b3-van-dong': vanDong,
  'b3-tam-guong': tamGuong,
  'b4-lien-he': lienHe,
  'b4-nhan-qua': nhanQua,
  'b4-tat-nhien': tatNhien,
  'b4-luong-chat': luongChat,
  'b5-con-duong': conDuong,
  'c6-banh-rang': banhRang,
  'c8-tinh-the': tinhThe,
  'c9-bay-cot': bayCot,
};
