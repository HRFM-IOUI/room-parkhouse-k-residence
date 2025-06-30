import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';  // 新しいCSSインポート方法

const TabSwiper = () => {
  return (
    <div className="tab-swiper">
      <Swiper spaceBetween={50} slidesPerView={3} loop={true}>
        <SwiperSlide>
          <div className="tab-item">天気予報</div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="tab-item">電車運行情報</div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="tab-item">渋滞情報</div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="tab-item">社会ニュース</div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="tab-item">経済ニュース</div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default TabSwiper;
