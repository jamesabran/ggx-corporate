/**
 * Approved bank / e-wallet logos used in the GGX payout module.
 *
 * Source of truth: the "Bank Logos" page in the GGX-SHADCN Figma file.
 * Each SVG is exported 1:1 from Figma (150×150 viewBox, transparent
 * background, logo centered at its natural aspect ratio). Use these files
 * as-is — do not redraw, recolor, stretch, or restyle them.
 */

import allbank from '../../assets/banks/allbank.svg?no-inline';
import asiaUnitedBank from '../../assets/banks/asia-united-bank.svg?no-inline';
import bankOfCommerce from '../../assets/banks/bank-of-commerce.svg?no-inline';
import bpi from '../../assets/banks/bpi.svg?no-inline';
import bdoNetworkBank from '../../assets/banks/bdo-network-bank.svg?no-inline';
import bdoUnibank from '../../assets/banks/bdo-unibank.svg?no-inline';
import bpiFamilySavingsBank from '../../assets/banks/bpi-family-savings-bank.svg?no-inline';
import chinabank from '../../assets/banks/chinabank.svg?no-inline';
import chinabankSavings from '../../assets/banks/chinabank-savings.svg?no-inline';
import cimbBank from '../../assets/banks/cimb-bank.svg?no-inline';
import citibank from '../../assets/banks/citibank.svg?no-inline';
import ctbcBank from '../../assets/banks/ctbc-bank.svg?no-inline';
import dbp from '../../assets/banks/dbp.svg?no-inline';
import eastwestBank from '../../assets/banks/eastwest-bank.svg?no-inline';
import gcash from '../../assets/banks/gcash.svg?no-inline';
import gotymeBank from '../../assets/banks/gotyme-bank.svg?no-inline';
import grabpay from '../../assets/banks/grabpay.svg?no-inline';
import hsbc from '../../assets/banks/hsbc.svg?no-inline';
import landbank from '../../assets/banks/landbank.svg?no-inline';
import luluMoney from '../../assets/banks/lulu-money.svg?no-inline';
import maribank from '../../assets/banks/maribank.svg?no-inline';
import maya from '../../assets/banks/maya.svg?no-inline';
import maybank from '../../assets/banks/maybank.svg?no-inline';
import metrobank from '../../assets/banks/metrobank.svg?no-inline';
import netbank from '../../assets/banks/netbank.svg?no-inline';
import palawanpay from '../../assets/banks/palawanpay.svg?no-inline';
import pbcom from '../../assets/banks/pbcom.svg?no-inline';
import pnb from '../../assets/banks/pnb.svg?no-inline';
import philippineVeteransBank from '../../assets/banks/philippine-veterans-bank.svg?no-inline';
import psbank from '../../assets/banks/psbank.svg?no-inline';
import rcbc from '../../assets/banks/rcbc.svg?no-inline';
import robinsonsBank from '../../assets/banks/robinsons-bank.svg?no-inline';
import securityBank from '../../assets/banks/security-bank.svg?no-inline';
import standardChartered from '../../assets/banks/standard-chartered.svg?no-inline';
import sterlingBankOfAsia from '../../assets/banks/sterling-bank-of-asia.svg?no-inline';
import tonik from '../../assets/banks/tonik.svg?no-inline';
import ucpb from '../../assets/banks/ucpb.svg?no-inline';
import unionbank from '../../assets/banks/unionbank.svg?no-inline';

export interface BankLogo {
  /** Complete public-facing brand name. */
  name: string;
  /** Download filename (lowercase kebab-case). */
  file: string;
  /** Resolved asset URL. */
  src: string;
}

/** All payout bank/e-wallet logos, sorted A–Z by brand name. */
export const BANK_LOGOS: BankLogo[] = [
  { name: 'AllBank', file: 'allbank.svg', src: allbank },
  { name: 'Asia United Bank (AUB)', file: 'asia-united-bank.svg', src: asiaUnitedBank },
  { name: 'Bank of Commerce', file: 'bank-of-commerce.svg', src: bankOfCommerce },
  { name: 'Bank of the Philippine Islands (BPI)', file: 'bpi.svg', src: bpi },
  { name: 'BDO Network Bank', file: 'bdo-network-bank.svg', src: bdoNetworkBank },
  { name: 'BDO Unibank', file: 'bdo-unibank.svg', src: bdoUnibank },
  { name: 'BPI Family Savings Bank', file: 'bpi-family-savings-bank.svg', src: bpiFamilySavingsBank },
  { name: 'Chinabank', file: 'chinabank.svg', src: chinabank },
  { name: 'Chinabank Savings', file: 'chinabank-savings.svg', src: chinabankSavings },
  { name: 'CIMB Bank', file: 'cimb-bank.svg', src: cimbBank },
  { name: 'Citibank', file: 'citibank.svg', src: citibank },
  { name: 'CTBC Bank (Philippines)', file: 'ctbc-bank.svg', src: ctbcBank },
  { name: 'Development Bank of the Philippines (DBP)', file: 'dbp.svg', src: dbp },
  { name: 'EastWest Bank', file: 'eastwest-bank.svg', src: eastwestBank },
  { name: 'GCash', file: 'gcash.svg', src: gcash },
  { name: 'GoTyme Bank', file: 'gotyme-bank.svg', src: gotymeBank },
  { name: 'GrabPay', file: 'grabpay.svg', src: grabpay },
  { name: 'HSBC', file: 'hsbc.svg', src: hsbc },
  { name: 'LANDBANK (Land Bank of the Philippines)', file: 'landbank.svg', src: landbank },
  { name: 'LuLu Money', file: 'lulu-money.svg', src: luluMoney },
  { name: 'MariBank', file: 'maribank.svg', src: maribank },
  { name: 'Maya', file: 'maya.svg', src: maya },
  { name: 'Maybank', file: 'maybank.svg', src: maybank },
  { name: 'Metrobank', file: 'metrobank.svg', src: metrobank },
  { name: 'Netbank', file: 'netbank.svg', src: netbank },
  { name: 'PalawanPay', file: 'palawanpay.svg', src: palawanpay },
  { name: 'PBCOM (Philippine Bank of Communications)', file: 'pbcom.svg', src: pbcom },
  { name: 'Philippine National Bank (PNB)', file: 'pnb.svg', src: pnb },
  { name: 'Philippine Veterans Bank', file: 'philippine-veterans-bank.svg', src: philippineVeteransBank },
  { name: 'PSBank (Philippine Savings Bank)', file: 'psbank.svg', src: psbank },
  { name: 'RCBC', file: 'rcbc.svg', src: rcbc },
  { name: 'Robinsons Bank', file: 'robinsons-bank.svg', src: robinsonsBank },
  { name: 'Security Bank', file: 'security-bank.svg', src: securityBank },
  { name: 'Standard Chartered', file: 'standard-chartered.svg', src: standardChartered },
  { name: 'Sterling Bank of Asia', file: 'sterling-bank-of-asia.svg', src: sterlingBankOfAsia },
  { name: 'Tonik', file: 'tonik.svg', src: tonik },
  { name: 'UCPB', file: 'ucpb.svg', src: ucpb },
  { name: 'UnionBank', file: 'unionbank.svg', src: unionbank },
];
