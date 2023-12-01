import { WorkBook, utils } from 'xlsx';
import { HolidayType } from './request';

const CHECK_START_HOUR = 8;
const CHECK_START_MIN = 30;
const CHECK_END_HOUR = 17;
const CHECK_END_MIN = 30;

export interface SheetDataType {
  '序号': string | number;
  '日期\r\n姓名': string;
  [x: string]: string | number;
}

interface OriginSheetDataType {
  [x: string]: string;
}

/**
 * 读取excel数据
 * @param workbook 
 * @param dateList 
 * @returns 
 */
export const readExcel = (workbook: WorkBook, dateList: HolidayType[] = []) => {
  const dateMapList = dateList.map(item => {
    let value = '';
    if (item.typeDes === '休息日') {
      value = '休';
    } else if (item.typeDes !== '工作日') {
      value = item.typeDes.slice(0, 1);
    }
    return value;
  });
  const { SheetNames, Sheets } = workbook;
  const originData: OriginSheetDataType[] = utils.sheet_to_json(Sheets[SheetNames[0]]);

  const daysData = originData[2];
  const daysKey: string[] = [];
  const userData = originData.slice(3);
  const userNameKey = Sheets[SheetNames[0]].A1.h;
  const daysReg = /^(\d{1,2})(\r?\n?)([一二三四五六日]{1})$/;
  Object.keys(daysData).forEach(key => {
    if (daysReg.test(daysData[key])) {
      daysKey.push(key);
    }
  });
  console.log('userData>>>>>>>>>>>>>', userData);
  console.log('daysKey>>>>>>>>>>>>>', daysKey);
  const sheetInfo: SheetDataType = {
    '序号': '',
    '日期\r\n姓名': '',
  };
  const sheetData = userData.map((item, index) => {
    const userItem: SheetDataType = {
      '序号': index + 1,
      '日期\r\n姓名': item[userNameKey],
    };
    daysKey.forEach(key => {
      const len = daysData[key].length;
      const ind = daysData[key].slice(-len, len - 1);
      const weekDay = daysData[key].slice(-1);
      userItem[ind] = workStatus(item[key], Number(ind), dateMapList);
      sheetInfo[ind] = weekDay;
    });
    return userItem;
  });
  sheetData.unshift(sheetInfo);

  console.log('sheetData>>>>>>>>>>>>', sheetData);

  return {
    sheetData,
    sheetName: SheetNames[0],
  };
}

/**
 * 判断工作状态
 * @param value 
 * @param ind 
 * @param dateMapList 
 */
const workStatus = (value: string, ind: number, dateMapList: string[] = []) => {

  /* if (!value.includes('补卡')) {
    if (value.includes('缺卡(09:00)')) {
      if (value.includes('早退')) {
        return '上班未打卡；○';
      }
    }
    if (value.includes('缺卡(17:20)')) {
      if (value.includes('迟到')) {
        return '▲；下班未打卡';
      }
    }
    if (value.includes('迟到') && value.includes('早退')) {
      return '▲；○';
    }
  }

  const leaveList = [
    {
      type: value.includes('缺卡(09:00)'),
      value: '上班未打卡'
    },
    {
      type: value.includes('缺卡(17:20)'),
      value: '下班未打卡'
    },
    {
      type: value.includes('迟到'),
      value: '▲'
    },
    {
      type: value.includes('早退'),
      value: '○'
    },
    {
      type: value.includes('旷工'),
      value: '☆'
    },
    {
      type: value.includes('停电'),
      value: '⊕'
    },
    {
      type: value.includes('事假'),
      value: '事'
    },
    {
      type: value.includes('病假'),
      value: '病'
    },
    {
      type: value.includes('产假'),
      value: '产'
    },
    {
      type: value.includes('丧假'),
      value: '丧'
    },
    {
      type: value.includes('婚假'),
      value: '婚'
    },
    {
      type: value.includes('调休') || value.includes('请假'),
      value: '休'
    },
  ];
  const leaveRes = leaveList.find(h => h.type)?.value;
  if (leaveRes) return leaveRes;

  if (value.includes('休息')) {
    return dateMapList[ind - 1];
  } */

  // 所有的休息
  if (value === '--') {
    return dateMapList[ind - 1] || '--';
  }

  const startTime = value.split(';')[0] || '';
  const endTime = value.split(';')[1]?.trim() || '';

  let checkRes = '';

  if (startTime && endTime) {
    const startHour = Number(startTime.split(':')[0]);
    const startMin = Number(startTime.split(':')[1]);
    // 迟到
    if (startHour > CHECK_START_HOUR || (startHour === CHECK_START_HOUR && startMin > CHECK_START_MIN)) {
      checkRes += '▲';
    }
    const endHour = Number(startTime.split(':')[1]);
    const endMin = Number(startTime.split(':')[1]);
    // 早退
    if (endHour < CHECK_END_HOUR || (endHour === CHECK_END_HOUR && endMin < CHECK_END_MIN)) {
      checkRes += ((checkRes ? '；' : '') + '○');
    }
  } else {
    return value;
  }

  return checkRes || '√';
}

/* 
  {
    year: '',
    month: '',
    startTime: '',
    endTime: '',
    data: [
      {
        序号: '',
        姓名/日期: '',
        1: '日',
        2: '一',
        3: '二',
        4: '三',
        ...,
        31: '二',
      },
      {
        序号: '1',
        姓名/日期: 'xxx',
        1: '休',
        2: '休',
        3: '休',
        4: '休',
        ...,
        31: '√',
      },
    ]
  }
*/