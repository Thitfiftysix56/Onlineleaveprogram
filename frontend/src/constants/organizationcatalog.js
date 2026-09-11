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
export const divisionNamesFor = (departmentName) => Object.keys(organizationCatalog[departmentName] || {});
export const positionGroupsFor = (departmentName, divisionName) => Object.keys(organizationCatalog[departmentName]?.[divisionName] || {});
export const positionNamesFor = (departmentName, divisionName, positionGroup) => organizationCatalog[departmentName]?.[divisionName]?.[positionGroup] || [];
