import { extend } from 'umi-request';
import { message } from 'antd';

const request = extend({
  // 最大请求时间 30s
  timeout: 30000,
  // 超时文案
  timeoutMessage: '网络超时...',
  // 错误统一处理
  errorHandler: (err) => {
    message.error(err.message || '未知的错误');
    return Promise.reject(err.message || '未知的错误');
  },
});

export interface HolidayType {
  typeDes: string;
}

/**
 * 获取当前月份中所有的法定节假日
 * @param date yyyyMMdd
 * @param ignoreHoliday 
 * @returns 
 */
export const getHoliday = (date: string, ignoreHoliday: boolean = false) => {
  return request.get<{data: HolidayType[]}>(`https://www.mxnzp.com/api/holiday/list/month/${date}`,
    {
      params: {
        ignoreHoliday, // 是否忽略节假日，仅获取万年历
        app_id: 'ecqvgalqkxjnhswd',
        app_secret: 'bHJtcmdmYjNQekVZL0FSdk16NktqQT09'
      }
    }
  );
}