import { useState, useEffect, useMemo } from 'react';
import { Form, Button, DatePicker, Upload, UploadFile, Spin, message } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload/interface';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import styles from './index.less';
import { readExcel, SheetDataType } from '@util/excel';
import { getHoliday, HolidayType } from '@util/request';

const { Dragger } = Upload;

export default function IndexPage() {

  // excel文件
  const [file, setFile] = useState<UploadFile<any>>();
  // excel文件名
  const [excelName, setExcelName] = useState<string>('output.xlsx');
  // 表格当前表的名字
  const [sheetName, setSheetName] = useState<string>('Sheet1');
  // 当前月份节假日列表
  const [dateList, setDateList] = useState<HolidayType[]>([]);
  // 表格数据json
  const [sheetData, setSheetData] = useState<SheetDataType[]>([]);
  // loading
  const [loading, setLoading] = useState<boolean>(false);

  let timeStamp: NodeJS.Timeout;

  const excelReader = useMemo(() => {
    const reader = new FileReader();
    reader.onload = e => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const { sheetData, sheetName } = readExcel(workbook, dateList);
      setSheetData(sheetData);
      setSheetName(sheetName);
      message.success('数据处理成功，请点击下载按钮下载文件！');
    };
    return reader;
  }, [dateList]);

  useEffect(() => {
    if (file && dateList.length) {
      message.info('正在处理数据，请稍候......');
      setTimeout(() => {
        excelReader.readAsBinaryString(file.originFileObj!);
      }, 2000);
    }
  }, [dateList, file]);

  const handleFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    timeStamp && clearTimeout(timeStamp);
    timeStamp = setTimeout(() => {
      const { file, fileList } = info;
      setFile(fileList[0]);
      if (fileList.length) {
        setExcelName(file.name);
      }
    }, 500);
  }

  const handleDateChange = (value: moment.Moment | null, dateString: string) => {
    if (dateString) {
      setLoading(true);
      getHoliday(dateString.replace('-', ''))
        .then(res => setDateList(res.data))
        .finally(() => setLoading(false))
    } else {
      setDateList([]);
    }
  }

  const handleFinish = () => {
    message.success('正在下载......');
    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(sheetData!);
    // 合并单元格的规则
    sheet['!merges'] = [
      {
        e: { c: 0, r: 1 },
        s: { c: 0, r: 0 },
      },
      {
        e: { c: 1, r: 1 },
        s: { c: 1, r: 0 },
      }
    ];
    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
    XLSX.writeFile(wb, excelName);
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.container}>
        <Form
          labelCol={{ xs: 24, sm: 4 }}
          wrapperCol={{ xs: 24, sm: 24 }}
          autoComplete='off'
          onFinish={handleFinish}
        >
          <Form.Item
            label='打卡月份'
            name='time'
            rules={[{ required: true, message: '请选择打卡月份' }]}
          >
            <DatePicker picker="month" onChange={handleDateChange} />
          </Form.Item>
          <Form.Item
            label='原文件'
            name='file'
            getValueFromEvent={({ fileList }) => (fileList.length ? { fileList } : null)}
            rules={[{ required: true, message: '请上传原文件' }]}
          >
            <Dragger
              className={styles.upload}
              name='file'
              accept='.xls,.xlsx,.csv'
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleFileChange}
            >
              <p className={styles.icon}><InboxOutlined /></p>
              <p>请点击上传或者拖拽文件到此处</p>
            </Dragger>
          </Form.Item>
          <Button
            className={styles.download}
            type='primary'
            htmlType='submit'
          >
            下载
          </Button>
        </Form>
      </div>
    </Spin>
  );
}

/* 
  excel写入
  1. 创建工作蒲（WorkBook）
  2. 创建sheet（WorkBook.Sheet）
  3. 创建表格行列（WorkBook.sheet[]）

  excel读取
  XLSX.read(data, {type: type}) 返回WorkBook的对象
  type：base64 | binary | string | buffer | array | file
*/
