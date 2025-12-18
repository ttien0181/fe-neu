import React from 'react';
import { Card } from '../components/ui';

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.5l.235-.235A2 2 0 0110 4h4a2 2 0 011.414.586l.235.235m-5.414 15.5l.235.235A2 2 0 0010 20h4a2 2 0 001.414-.586l.235-.235m-5.414-15.5l-2.121 2.121m5.414 11.263L12 18.263m3.293-3.055l2.121 2.121m-5.414-11.263L12 5.737m-3.293 3.055L6.586 6.586" />
    </svg>
);

const DocumentIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const AboutPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-background dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary dark:text-slate-100 tracking-tight">
            Văn phòng Luật sư Quốc tế Bình An
          </h1>
          <p className="mt-4 text-lg md:text-xl text-secondary dark:text-slate-400 max-w-3xl mx-auto">
            Cung cấp tư vấn pháp lý chuyên nghiệp với sự chính trực và tận tâm từ năm 2011.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
            <GlobeIcon />
            <h2 className="text-2xl font-bold text-primary dark:text-slate-100 mt-4 mb-2">Về Chúng Tôi</h2>
            <p className="text-secondary dark:text-slate-400">
              Văn phòng Luật sư Quốc tế Bình An được thành lập vào ngày 20/04/2011, được cấp phép bởi Sở Tư pháp TP. Hà Nội. Với đội ngũ luật sư giàu kinh nghiệm, chúng tôi cam kết mang lại giải pháp pháp lý toàn diện và hiệu quả cho khách hàng.
            </p>
          </Card>
          
          <Card className="p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-primary dark:text-slate-100 mt-4 mb-2">Sứ Mệnh</h2>
            <p className="text-secondary dark:text-slate-400">
              Sứ mệnh của chúng tôi là bảo vệ quyền và lợi ích hợp pháp của khách hàng thông qua sự tận tâm, chuyên nghiệp và đạo đức nghề nghiệp. Chúng tôi luôn đặt lợi ích của khách hàng lên hàng đầu trong mọi hoạt động.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center md:col-span-2 lg:col-span-1">
             <DocumentIcon />
             <h2 className="text-2xl font-bold text-primary dark:text-slate-100 mt-4 mb-2">Thông Tin Pháp Lý</h2>
             <ul className="space-y-2 text-secondary dark:text-slate-400">
                <li><strong className="font-medium text-primary dark:text-slate-200">Ngày cấp phép:</strong> 20/04/2011</li>
                <li><strong className="font-medium text-primary dark:text-slate-200">Cơ quan cấp:</strong> Sở Tư pháp TP. Hà Nội</li>
             </ul>
          </Card>
        </div>

        <div className="mt-16">
          <Card className="p-8">
            <h2 className="text-3xl font-bold text-center text-primary dark:text-slate-100 mb-8">Liên Hệ Với Chúng Tôi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 text-left">
              <div>
                <h3 className="text-xl font-semibold text-accent mb-3">Trụ sở chính</h3>
                <p className="text-secondary dark:text-slate-400">2/532 Ngọc Thụy, Tổ 19, phường Ngọc Thụy, Long Biên, TP. Hà Nội</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent mb-3">Văn phòng giao dịch</h3>
                <p className="text-secondary dark:text-slate-400">Số 13 ngõ Hàng Bột, phường Cát Linh, quận Đống Đa, TP. Hà Nội</p>
              </div>
              <div className="md:col-span-2 border-t border-border dark:border-slate-700 pt-6 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <p className="text-secondary dark:text-slate-400"><strong className="font-medium text-primary dark:text-slate-200 block">Tel:</strong> 04 22404068</p>
                 <p className="text-secondary dark:text-slate-400"><strong className="font-medium text-primary dark:text-slate-200 block">Fax:</strong> 0437877913</p>
                 <p className="text-secondary dark:text-slate-400"><strong className="font-medium text-primary dark:text-slate-200 block">Email:</strong> luatbinhan@gmail.com</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;