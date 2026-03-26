export interface BankDefinition {
  name: string;
  nameLong: string;
  nameEN: string;
  symbol: string;
  icon: string; // We will map this to local path
}

export const THAI_BANKS: Record<string, BankDefinition> = {
  "BAAC": {
    "name": "ธ.ก.ส.",
    "nameLong": "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
    "nameEN": "Bank for Agriculture and Agricultural Cooperatives",
    "symbol": "BAAC",
    "icon": "/icons/banks/BAAC.png"
  },
  "BAY": {
    "name": "กรุงศรีอยุธยา",
    "nameLong": "ธนาคารกรุงศรีอยุธยา",
    "nameEN": "Krungsri Bank",
    "symbol": "BAY",
    "icon": "/icons/banks/BAY.png"
  },
  "BBL": {
    "name": "กรุงเทพ",
    "nameLong": "ธนาคารกรุงเทพ",
    "nameEN": "Bangkok Bank",
    "symbol": "BBL",
    "icon": "/icons/banks/BBL.png"
  },
  "CIMB": {
    "name": "ซีไอเอ็มบี",
    "nameLong": "ธนาคารซีไอเอ็มบี",
    "nameEN": "CIMB Thai Bank",
    "symbol": "CIMB",
    "icon": "/icons/banks/CIMB.png"
  },
  "CITI": {
    "name": "ซิตี้แบงก์",
    "nameLong": "ธนาคารซิตี้แบงก์",
    "nameEN": "citibank",
    "symbol": "CITI",
    "icon": "/icons/banks/CITI.png"
  },
  "GHB": {
    "name": "ธ.อ.ส.",
    "nameLong": "ธนาคารอาคารสงเคราะห์",
    "nameEN": "GH Bank",
    "symbol": "GHB",
    "icon": "/icons/banks/GHB.png"
  },
  "GSB": {
    "name": "ออมสิน",
    "nameLong": "ธนาคารออมสิน",
    "nameEN": "Government Savings Bank",
    "symbol": "GSB",
    "icon": "/icons/banks/GSB.png"
  },
  "HSBC": {
    "name": "เอชเอสบีซี",
    "nameLong": "ธนาคารเอชเอสบีซี",
    "nameEN": "HSBC Bank",
    "symbol": "HSBC",
    "icon": "/icons/banks/HSBC.png"
  },
  "IBANK": {
    "name": "อิสลามแห่งประเทศไทย",
    "nameLong": "ธนาคารอิสลามแห่งประเทศไทย",
    "nameEN": "Islamic Bank of Thailand",
    "symbol": "IBANK",
    "icon": "/icons/banks/IBANK.png"
  },
  "ICBC": {
    "name": "ไอซีบีซี",
    "nameLong": "ธนาคารไอซีบีซี",
    "nameEN": "ICBC Thai Commercial Bank",
    "symbol": "ICBC",
    "icon": "/icons/banks/ICBC.png"
  },
  "KBANK": {
    "name": "กสิกรไทย",
    "nameLong": "ธนาคารกสิกรไทย",
    "nameEN": "Kasikorn Bank",
    "symbol": "KBANK",
    "icon": "/icons/banks/KBANK.png"
  },
  "KKP": {
    "name": "เกียรตินาคิน",
    "nameLong": "ธนาคารเกียรตินาคินภัทร",
    "nameEN": "Kiatnakin Phatra Bank",
    "symbol": "KKP",
    "icon": "/icons/banks/KKP.png"
  },
  "KTB": {
    "name": "กรุงไทย",
    "nameLong": "ธนาคารกรุงไทย",
    "nameEN": "Krungthai Bank",
    "symbol": "KTB",
    "icon": "/icons/banks/KTB.png"
  },
  "LHB": {
    "name": "แลนด์ แอนด์ เฮ้าส์",
    "nameLong": "ธนาคารแลนด์ แอนด์ เฮ้าส์",
    "nameEN": "LH Bank",
    "symbol": "LHB",
    "icon": "/icons/banks/LHB.png"
  },
  "PromptPay": {
    "name": "พร้อมเพย์",
    "nameLong": "พร้อมเพย์",
    "nameEN": "PromptPay",
    "symbol": "PromptPay",
    "icon": "/icons/banks/PromptPay.png"
  },
  "SCB": {
    "name": "ไทยพาณิชย์",
    "nameLong": "ธนาคารไทยพาณิชย์",
    "nameEN": "The Siam Commercial Bank",
    "symbol": "SCB",
    "icon": "/icons/banks/SCB.png"
  },
  "TCRB": {
    "name": "ไทยเครดิต",
    "nameLong": "ธนาคารไทยเครดิต",
    "nameEN": "Thai Credit Bank",
    "symbol": "TCRB",
    "icon": "/icons/banks/TCRB.png"
  },
  "TISCO": {
    "name": "ทิสโก้",
    "nameLong": "ธนาคารทิสโก้",
    "nameEN": "Tisco Bank",
    "symbol": "TISCO",
    "icon": "/icons/banks/TISCO.png"
  },
  "TrueMoney": {
    "name": "ทรูมันนี่",
    "nameLong": "ทรูมันนี่",
    "nameEN": "True Money",
    "symbol": "TrueMoney",
    "icon": "/icons/banks/TrueMoney.png"
  },
  "TTB": {
    "name": "ทีเอ็มบีธนชาต",
    "nameLong": "ธนาคารทีเอ็มบีธนชาต",
    "nameEN": "TMBThanachart Bank",
    "symbol": "TTB",
    "icon": "/icons/banks/TTB.png"
  },
  "UOB": {
    "name": "ยูโอบี",
    "nameLong": "ธนาคารยูโอบี",
    "nameEN": "United Overseas Bank",
    "symbol": "UOB",
    "icon": "/icons/banks/UOB.png"
  }
};
