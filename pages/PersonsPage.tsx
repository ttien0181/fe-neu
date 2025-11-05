import React from 'react';

// Image data is embedded as constants to avoid needing a separate assets folder.
// In a real project, these would be in /assets/images/
const image1 = 'https://storage.googleapis.com/aistudio-hosting/history/24911718/instances/30172314/image.jpg';
const image2 = 'https://storage.googleapis.com/aistudio-hosting/history/24911718/instances/30172315/image.jpg';
const image3 = 'https://storage.googleapis.com/aistudio-hosting/history/24911718/instances/30172316/image.jpg';
const image4 = 'https://storage.googleapis.com/aistudio-hosting/history/24911718/instances/30172317/image.jpg';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-background pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-surface p-8 sm:p-12 rounded-2xl shadow-lg border border-border">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4 text-center">
            Văn phòng Luật sư Quốc tế Bình An
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-accent mb-6 text-center">10 năm hình thành và phát triển</h2>
          <p className="text-center text-secondary text-sm mb-10">26/04/2021 03:00</p>
          
          <div className="prose prose-lg max-w-none text-primary">
            <p className="lead">
              Với đội ngũ Luật sư và chuyên gia tư vấn chuyên nghiệp được đào tạo chuyên sâu, giàu nhiệt huyết và có tinh thần trách nhiệm cao đối với hoạt động nghề nghiệp; trong suốt quá trình 10 năm hình thành và phát triển, Văn phòng Luật sư Quốc tế Bình An luôn cam kết cung cấp cho khách hàng những dịch vụ pháp lý chuyên nghiệp với chất lượng và độ tin cậy cao cũng như các giải pháp sáng tạo cho các vấn đề của doanh nghiệp.
            </p>
            
            <figure className="my-10">
              <img src={image1} alt="Đội ngũ Văn phòng Luật sư Quốc tế Bình An" className="rounded-xl shadow-md w-full" />
              <figcaption className="text-center text-secondary text-sm mt-2">
                Luật sư Bùi Việt Anh, Trưởng Văn phòng Luật sư Quốc tế Bình An: "Chú trọng xây dựng một đội ngũ Luật sư và chuyên gia tư vấn được đào tạo chuyên sâu".
              </figcaption>
            </figure>

            <p>
              Được thành lập vào ngày 20/4/2011 bởi Luật sư Bùi Việt Anh, Văn phòng Luật sư Quốc tế Bình An có kinh nghiệm nhiều năm hoạt động trong các lĩnh vực cung ứng dịch vụ pháp lý, như: tham gia tố tụng, tư vấn pháp luật, đại diện ngoài tố tụng, các dịch vụ pháp luật khác với nhiều khách hàng là các cá nhân, tổ chức trong và ngoài nước liên quan đến các hoạt động đầu tư, dân sự, hình sự, kinh doanh thương mại, lao động…
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-10">
              <img src={image2} alt="Khách mời tặng hoa chúc mừng" className="rounded-xl shadow-md" />
              <img src={image3} alt="Lễ kỷ niệm 10 năm thành lập" className="rounded-xl shadow-md" />
            </div>
            <p className="text-center text-secondary text-sm -mt-6 mb-10">Khách mời tặng hoa chúc mừng Lễ kỷ niệm 10 năm thành lập Văn phòng Luật sư Quốc tế Bình An.</p>

            <p>
              Để mang đến chất lương dịch vụ tốt nhất cho khách hàng, Luật sư Bùi Việt Anh chú trọng xây dựng một đội ngũ Luật sư và chuyên gia tư vấn được đào tạo chuyên sâu, là những chuyên gia có nhiều năm kinh nghiệm hành nghề ở Việt Nam. Luật sư Bùi Việt Anh, Trưởng Văn phòng Luật sư Quốc tế Bình An là người đã có 10 năm kinh nghiệm làm việc tại ngành tòa án; 04 năm làm Trưởng ban Pháp chế tại doanh nghiệp; 12 năm hành nghề Luật sư tại các tổ chức hành nghề Luật sư với các lĩnh vực hoạt động chính: bào chữa, bảo vệ quyền lợi cho bị can, bị cáo, đương sự trong các vụ án hình sự, dân sự, kinh doanh thương mại; tư vấn pháp luật, thực hiện dịch vụ pháp lý về các lĩnh vực: xuất khẩu lao động, đất đai, tư vấn doanh nghiệp, thương mại, đầu tư, các vấn đề pháp luật liên quan đến cá nhân, tổ chức nước ngoài; đại diện ngoài tố tụng để thực hiện các công việc có liên quan đến pháp luật. Ngoài ra, anh còn hoàn thành chương trình Thạc sĩ Quản lý kinh tế vào năm 2016.
            </p>
            
            <p>
              Hiện tại, Luật sư Bùi Việt Anh là Bí thư Chi bộ Luật sư Long Biên 3 thuộc Đảng bộ Đoàn Luật sư TP. Hà Nội và Phó Chủ tịch Hội đồng Khen thưởng – Kỷ luật Đoàn Luật sư TP. Hà Nội nhiệm kỳ X.
            </p>

            <blockquote className="border-l-4 border-accent pl-6 py-2 my-8 text-secondary italic">
              Với phương châm “Chuyên nghiệp – Tận tâm – Hiệu quả”, Văn phòng Luật sư Quốc tế Bình An luôn nhận được sự tin cậy của khách hàng.
            </blockquote>
            
            <figure className="my-10">
              <img src={image4} alt="Khách mời tại lễ kỷ niệm" className="rounded-xl shadow-md w-full" />
            </figure>

            <p>
              Văn phòng Luật sư Quốc tế Bình An tự hào về khả năng chia sẻ tầm nhìn của khách hàng và xử lý những thách thức và khó khăn pháp lý mà khách hàng phải đối mặt. Luật sư và chuyên gia của Văn phòng Luật sư Quốc tế Bình An luôn cung cấp các dịch vụ pháp lý với tinh thần và trách nhiệm cao nhất. Ngay từ khi được cấp phép hoạt động đến nay, trung bình một năm Văn phòng Luật sư Quốc tế Bình An ký kết hợp đồng dịch vụ pháp lý tham gia tranh tụng, tư vấn pháp luật và đại diện ngoài tố tụng gần 80 vụ án bao gồm cả hành chính, hình sự, dân sự, kinh tế, lao động…
            </p>
            <p>
              Trong suốt 10 năm hình thành và phát triển, với phương châm “Chuyên nghiệp – Tận tâm – Hiệu quả”, Văn phòng Luật sư Quốc tế Bình An không ngừng hoàn thiện và phát triển về cả nhân sự cũng chất lượng cung cấp dịch vụ pháp lý, nhận được sự tin cậy của khách hàng. Với những nỗ lực không ngừng nghỉ trong hoạt động nghề nghiệp, Luật sư Bùi Việt Anh, Trưởng Văn phòng Luật sư Quốc tế Bình An còn được nhận nhiều Bằng khen, Kỷ niệm chương của Đoàn Luật sư TP. Hà Nội.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;