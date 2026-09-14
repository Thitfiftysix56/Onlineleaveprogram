export const organizationCatalog = {
  'Information Technology': {
    Development: {
      Developer: ['Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer'],
    },
    Infrastructure: {
      Infrastructure: ['System Administrator', 'Network Engineer'],
    },
    'IT Support': {
      Support: ['IT Support Officer'],
    },
    Cybersecurity: {
      Cybersecurity: ['Cybersecurity Analyst'],
    },
  },
  'Human Resources': {
    Recruitment: {
      'Human Resources': ['Recruitment Officer'],
    },
    'Employee Relations': {
      'Human Resources': ['Human Resource Officer'],
    },
    'Payroll and Benefits': {
      'Human Resources': ['Payroll Officer'],
    },
    'Training and Development': {
      'Human Resources': ['Training Officer'],
    },
  },
  Finance: {
    Accounting: {
      Accounting: ['Accountant'],
    },
    'Financial Planning': {
      Finance: ['Financial Analyst'],
    },
    Treasury: {
      Finance: ['Treasury Officer'],
    },
  },
  Marketing: {
    'Digital Marketing': {
      Marketing: ['Marketing Officer'],
    },
    Content: {
      Marketing: ['Content Creator'],
    },
    'Market Research': {
      Marketing: ['Market Researcher'],
    },
  },
};

export const departmentNames = Object.keys(organizationCatalog);
export const departmentLabels = {
  'Information Technology': 'แผนกเทคโนโลยีสารสนเทศ',
  'Human Resources': 'แผนกทรัพยากรบุคคล',
  Finance: 'แผนกการเงิน',
  Marketing: 'แผนกการตลาด',
};
export const divisionLabels = {
  Development: 'ฝ่ายเทคโนโลยีสารสนเทศ',
  Infrastructure: 'ฝ่ายโครงสร้างพื้นฐาน',
  'IT Support': 'ฝ่ายสนับสนุนเทคโนโลยีสารสนเทศ',
  Cybersecurity: 'ฝ่ายความมั่นคงปลอดภัยสารสนเทศ',
  Recruitment: 'ฝ่ายสรรหาและคัดเลือกบุคลากร',
  'Employee Relations': 'ฝ่ายทรัพยากรบุคคล',
  'Payroll and Benefits': 'ฝ่ายเงินเดือนและสวัสดิการ',
  'Training and Development': 'ฝ่ายฝึกอบรมและพัฒนาบุคลากร',
  Accounting: 'ฝ่ายการเงิน',
  'Financial Planning': 'ฝ่ายวางแผนและวิเคราะห์การเงิน',
  Treasury: 'ฝ่ายบริหารเงินและสภาพคล่อง',
  'Digital Marketing': 'ฝ่ายการตลาด',
  Content: 'ฝ่ายเนื้อหาและการสื่อสารการตลาด',
  'Market Research': 'ฝ่ายวิจัยตลาด',
};
export const divisionLabelFor = (divisionName) => divisionLabels[divisionName] || divisionName || '-';
export const departmentLabelFor = (departmentName) => departmentLabels[departmentName] || departmentName || '-';
export const positionGroupLabels = {
  Developer: 'นักพัฒนาซอฟต์แวร์',
  Infrastructure: 'โครงสร้างพื้นฐาน',
  Support: 'สนับสนุนเทคโนโลยีสารสนเทศ',
  Cybersecurity: 'ความมั่นคงปลอดภัยไซเบอร์',
  'Human Resources': 'ทรัพยากรบุคคล',
  Accounting: 'บัญชี',
  Finance: 'การเงิน',
  Marketing: 'การตลาด',
};
export const positionGroupLabelFor = (positionGroup) => positionGroupLabels[positionGroup] || positionGroup || '-';
export const positionLabels = {
  Developer: 'นักพัฒนาซอฟต์แวร์',
  'Frontend Developer': 'นักพัฒนาฟรอนต์เอนด์',
  'Backend Developer': 'นักพัฒนาแบ็กเอนด์',
  'Full Stack Developer': 'นักพัฒนาฟูลสแตก',
  'Mobile Developer': 'นักพัฒนาแอปพลิเคชันมือถือ',
  'System Administrator': 'ผู้ดูแลระบบ',
  'Network Engineer': 'วิศวกรเครือข่าย',
  'IT Support Officer': 'เจ้าหน้าที่สนับสนุนไอที',
  'Cybersecurity Analyst': 'นักวิเคราะห์ความมั่นคงปลอดภัยไซเบอร์',
  'Recruitment Officer': 'เจ้าหน้าที่สรรหาบุคลากร',
  'Human Resource Officer': 'เจ้าหน้าที่ทรัพยากรบุคคล',
  'Payroll Officer': 'เจ้าหน้าที่เงินเดือนและสวัสดิการ',
  'Training Officer': 'เจ้าหน้าที่ฝึกอบรมและพัฒนา',
  Accountant: 'นักบัญชี',
  'Financial Analyst': 'นักวิเคราะห์การเงิน',
  'Treasury Officer': 'เจ้าหน้าที่บริหารเงิน',
  'Marketing Officer': 'เจ้าหน้าที่การตลาด',
  'Content Creator': 'ผู้สร้างสรรค์เนื้อหา',
  'Market Researcher': 'นักวิจัยตลาด',
  Supervisor: 'หัวหน้างาน',
};
export const positionLabelFor = (positionName) => positionLabels[positionName] || positionName || '-';
export const divisionNamesFor = (departmentName) => Object.keys(organizationCatalog[departmentName] || {});
export const positionGroupsFor = (departmentName, divisionName) => Object.keys(organizationCatalog[departmentName]?.[divisionName] || {});
export const positionNamesFor = (departmentName, divisionName, positionGroup) => organizationCatalog[departmentName]?.[divisionName]?.[positionGroup] || [];
