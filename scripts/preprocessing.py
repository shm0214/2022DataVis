import requests
import pandas as pd
import os
import pickle


def reGeo(csv_path):
    df = pd.read_csv(csv_path, encoding='utf-8')
    df.columns = [item.strip() for item in df.columns.values]
    del df['']
    lon = df['lon'].astype(str)
    lat = df['lat'].astype(str)
    new = lon + ',' + lat
    location_total = []
    for i in range(0, len(new.values), 20):
        if i + 20 > len(new.values):
            end = len(new.values)
        else:
            end = i + 20
        location_total.append('|'.join(new.values[i:end]))
    address_total = []
    for item in location_total:
        address_total += query(item)
    province = []
    city = []
    for item in address_total:
        province += [item['province']]
        city += [item['city']]
    return province, city


def query(location_list, key="00ac96eedfff37b26c15b04e708d43a9"):
    url = 'https://restapi.amap.com/v3/geocode/regeo'
    params = {
        'key': key,
        'location': location_list,  # limit: 20
        'batch': 'true'
    }
    res = requests.get(url, params=params).json()
    address_list = []
    if res['status'] == '1':
        for i in range(len(res['regeocodes'])):
            temp = res['regeocodes'][i]['addressComponent']
            province = temp['province']
            city = temp['city']
            if not city:
                if province in ['北京市', '天津市', '上海市', '重庆市']:
                    city = province  # 更改直辖市的 `province`` 和 `city` 字段都是直辖市的名称
                else:
                    # 更改省直辖县的 `city` 字段为 `district` 字段的数值
                    city = temp['district']
            else:
                pass
            address_list.append({'province': province, 'city': city})
        return address_list
    else:
        print({'info': res['info'], 'location_list': location_list})


def process(province, city):
    flag = True
    for path, dirs, files in os.walk("data/rawData"):
        for file in files:
            temp = file.split('-')[-1][:-6]
            year = int(temp[:4])
            month = int(temp[4:6])
            day = int(temp[6:])
            df = pd.read_csv(os.path.join(path, file), encoding='utf-8')
            df.columns = [item.strip() for item in df.columns.values]
            del df['']
            df['province'] = province
            df['city'] = city
            df['province'] = df['province'].astype(str)
            df['city'] = df['city'].astype(str)
            df = df.drop(['lat', 'lon'], axis=1)
            df = df.drop(df[df['province'] == '[]'].index)
            df = df.drop(df[(df['city'] == '[]')
                            & (df['province'] != '台湾省')].index)
            df = df.groupby(['province', 'city']).mean()
            df['year'] = year
            df['month'] = month
            df['day'] = day
            if flag:
                df.to_csv("data/data.csv", mode='w')
                flag = False
            else:
                df.to_csv("data/data.csv", mode='a+', header=0)


polRange = {
    "SO2": [0, 50, 150, 475, 800, 1600, 2100, 2620],
    "NO2": [0, 40, 80, 180, 280, 565, 750, 940],
    "PM10": [0, 50, 150, 250, 350, 420, 500, 600],
    "CO": [0, 2, 4, 14, 24, 36, 48, 60],
    "PM2.5": [0, 35, 75, 115, 150, 250, 350, 500],
    "O3": [0, 100, 160, 215, 265, 800]
}

aqiRange = [0, 50, 100, 150, 200, 300, 400, 500]


def aqi(x, pol='PM2.5'):
    polR = polRange[pol]
    idx = 0
    for i in range(len(polR) - 1):
        if x >= polR[i] and x < polR[i + 1]:
            idx = i
            break
    return (aqiRange[idx + 1] - aqiRange[idx]) / (
        polR[idx + 1] - polR[idx]) * (x - polR[idx]) + aqiRange[idx]


def cal_AQI():
    df = pd.read_csv("data/data.csv", encoding='utf-8')
    for k in polRange.keys():
        temp = list(map(aqi, df[k], [k] * len(df[k])))
    df[k + '-AQI'] = temp
    df.to_csv("data/data-AQI.csv", mode='w', index=False)


if __name__ == "__main__":
    if os.path.exists("data/province") and os.path.exists("data/city"):
        with open("data/province", 'rb') as f:
            province = pickle.load(f)
        with open("data/city", 'rb') as f:
            city = pickle.load(f)
    else:
        province, city = reGeo(
            "data/rawData201801/CN-Reanalysis-daily-2018010100.csv")
        with open("data/province", 'wb') as f:
            pickle.dump(province, f)
        with open("data/city", 'wb') as f:
            pickle.dump(city, f)
    process(province, city)
    cal_AQI()