import type { QuizQuestion } from './types';

// Câu hỏi tự biên soạn từ nội dung hiện vật (SRS FR-16); anh Duy rà trước GATE-4.
// `answer` là chỉ số trong `options` gốc — thứ tự hiển thị được xáo mỗi lượt.
export const quiz: QuizQuestion[] = [
  // P01
  {
    id: 'P01-q1', room: 'P01', exhibitIds: ['a1-van-de-co-ban'],
    prompt: 'Theo Ph. Ăngghen, vấn đề cơ bản lớn của mọi triết học là vấn đề gì?',
    options: ['Quan hệ giữa tư duy với tồn tại', 'Quan hệ giữa con người với thần linh', 'Nguồn gốc của các tôn giáo', 'Phương pháp nghiên cứu của khoa học tự nhiên'],
    answer: 0,
    explanation: 'Vấn đề cơ bản của triết học là quan hệ giữa tư duy và tồn tại (ý thức và vật chất), gồm hai mặt: cái nào có trước, quyết định cái nào; và con người có nhận thức được thế giới hay không.',
  },
  {
    id: 'P01-q2', room: 'P01', exhibitIds: ['a1-vat-tu-no'],
    prompt: 'Học thuyết phủ nhận khả năng nhận thức thế giới của con người gọi là gì?',
    options: ['Khả tri luận', 'Nhị nguyên luận', 'Bất khả tri luận', 'Chủ nghĩa duy vật chất phác'],
    answer: 2,
    explanation: 'Bất khả tri luận (Hume, Kant) phủ nhận khả năng nhận thức thế giới; thuật ngữ do T.H. Huxley đưa ra năm 1869. Khả tri luận thì khẳng định con người nhận thức được thế giới.',
  },
  {
    id: 'P01-q3', room: 'P01', exhibitIds: ['a1-duy-vat-duy-tam'],
    prompt: 'Hình thức nào của chủ nghĩa duy vật do C. Mác và Ph. Ăngghen sáng lập?',
    options: ['Chủ nghĩa duy vật chất phác', 'Chủ nghĩa duy vật siêu hình', 'Chủ nghĩa duy vật biện chứng', 'Chủ nghĩa duy vật tầm thường'],
    answer: 2,
    explanation: 'Chủ nghĩa duy vật có ba hình thức: chất phác (cổ đại), siêu hình (thế kỷ XV – XVIII) và biện chứng — do C. Mác, Ph. Ăngghen sáng lập, V.I. Lênin phát triển.',
  },
  {
    id: 'P01-q4', room: 'P01', exhibitIds: ['a1-cay-va-rung'],
    prompt: 'Ph. Ăngghen phê phán phương pháp siêu hình là "chỉ nhìn thấy cây mà không thấy rừng" vì nó:',
    options: ['Xem xét sự vật trong trạng thái cô lập, tĩnh tại', 'Xem xét sự vật trong liên hệ và vận động', 'Coi vật chất là cái có trước', 'Dùng thực tiễn để kiểm nghiệm tri thức'],
    answer: 0,
    explanation: 'Phương pháp siêu hình tách sự vật khỏi các mối liên hệ và coi nó bất biến, nên chỉ thấy từng cái riêng lẻ. Phương pháp biện chứng xem sự vật trong liên hệ và vận động.',
  },

  // P02
  {
    id: 'P02-q1', room: 'P02', exhibitIds: ['a2-ba-nguon-goc'],
    prompt: 'Ba nguồn gốc lý luận của triết học Mác là gì?',
    options: [
      'Triết học Hy Lạp, triết học Ấn Độ, triết học Trung Hoa',
      'Triết học cổ điển Đức, kinh tế chính trị cổ điển Anh, chủ nghĩa xã hội không tưởng Pháp',
      'Thuyết tế bào, thuyết tiến hóa, định luật bảo toàn và chuyển hóa năng lượng',
      'Triết học Khai sáng Pháp, kinh tế học Mỹ, thần học Đức',
    ],
    answer: 1,
    explanation: 'Ba nguồn gốc lý luận: triết học cổ điển Đức, kinh tế chính trị cổ điển Anh, chủ nghĩa xã hội không tưởng Pháp. Thuyết tế bào, thuyết tiến hóa và định luật bảo toàn năng lượng là ba tiền đề khoa học tự nhiên.',
  },
  {
    id: 'P02-q2', room: 'P02', exhibitIds: ['a2-luan-cuong'],
    prompt: 'Luận cương thứ 11 về Phoiơbắc của C. Mác nhấn mạnh điều gì?',
    options: ['Triết học chỉ cần giải thích thế giới', 'Ý thức quyết định tồn tại', 'Con người không thể nhận thức được thế giới', 'Vấn đề là cải tạo thế giới'],
    answer: 3,
    explanation: '"Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, song vấn đề là cải tạo thế giới." Triết học Mác gắn lý luận với thực tiễn cải tạo xã hội.',
  },
  {
    id: 'P02-q3', room: 'P02', exhibitIds: ['a2-chuc-nang'],
    prompt: 'Hai chức năng cơ bản của triết học Mác – Lênin là gì?',
    options: ['Thế giới quan và phương pháp luận', 'Dự báo và tiên tri', 'Giáo dục và giải trí', 'Kinh tế và chính trị'],
    answer: 0,
    explanation: 'Triết học Mác – Lênin có chức năng thế giới quan và chức năng phương pháp luận. Nó không phải "đơn thuốc vạn năng" giải đáp sẵn mọi vấn đề.',
  },
  {
    id: 'P02-q4', room: 'P02', exhibitIds: ['a2-angghen', 'a2-mac'],
    prompt: 'C. Mác và Ph. Ăngghen gặp nhau tại Paris, mở đầu sự cộng tác suốt đời, vào thời gian nào?',
    options: ['Tháng 4/1841', 'Tháng 8/1844', 'Năm 1848', 'Năm 1867'],
    answer: 1,
    explanation: 'Tháng 8/1844, Ph. Ăngghen gặp C. Mác tại Paris. Năm 1848 là năm ra đời Tuyên ngôn của Đảng Cộng sản; năm 1867 là năm xuất bản Tư bản, tập I.',
  },

  // P03
  {
    id: 'P03-q1', room: 'P03', exhibitIds: ['b3-dinh-nghia'],
    prompt: 'Định nghĩa "Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan…" là của ai?',
    options: ['Ph. Ăngghen', 'Democritos', 'G.W.F. Hegel', 'V.I. Lênin'],
    answer: 3,
    explanation: 'Đây là định nghĩa vật chất của V.I. Lênin: vật chất là thực tại khách quan, được cảm giác chép lại, chụp lại, phản ánh, và tồn tại không lệ thuộc vào cảm giác.',
  },
  {
    id: 'P03-q2', room: 'P03', exhibitIds: ['b3-van-dong'],
    prompt: 'Trong năm hình thức vận động cơ bản theo Ph. Ăngghen, hình thức nào cao nhất?',
    options: ['Vận động cơ học', 'Vận động hóa học', 'Vận động xã hội', 'Vận động sinh học'],
    answer: 2,
    explanation: 'Từ thấp đến cao: cơ học, vật lý, hóa học, sinh học, xã hội. Hình thức cao bao hàm hình thức thấp nhưng không quy được về chúng.',
  },
  {
    id: 'P03-q3', room: 'P03', exhibitIds: ['b3-nguon-goc-y-thuc'],
    prompt: 'Nguồn gốc xã hội của ý thức gồm những yếu tố nào?',
    options: ['Bộ óc người và hoạt động phản ánh', 'Lao động và ngôn ngữ', 'Không gian và thời gian', 'Tri thức, tình cảm và ý chí'],
    answer: 1,
    explanation: 'Nguồn gốc tự nhiên là bộ óc người và hoạt động phản ánh; nguồn gốc xã hội là lao động và ngôn ngữ — "Trước hết là lao động; sau lao động và đồng thời với lao động là ngôn ngữ".',
  },
  {
    id: 'P03-q4', room: 'P03', exhibitIds: ['b3-quan-he'],
    prompt: 'Bài học phương pháp luận rút ra từ mối quan hệ giữa vật chất và ý thức là gì?',
    options: [
      'Chỉ cần ý chí mạnh là làm được mọi việc',
      'Chờ đợi điều kiện khách quan tự thay đổi',
      'Tôn trọng khách quan, đồng thời phát huy tính năng động chủ quan',
      'Coi nhẹ vai trò của lý luận',
    ],
    answer: 2,
    explanation: 'Vật chất quyết định ý thức, ý thức tác động trở lại. Vì vậy phải tôn trọng khách quan và phát huy tính năng động chủ quan; chống chủ quan duy ý chí và chống thụ động, ỷ lại.',
  },

  // P04
  {
    id: 'P04-q1', room: 'P04', exhibitIds: ['b4-lien-he'],
    prompt: 'Từ nguyên lý về mối liên hệ phổ biến, ta rút ra quan điểm nào?',
    options: ['Quan điểm phát triển', 'Quan điểm toàn diện', 'Quan điểm siêu hình', 'Quan điểm duy tâm'],
    answer: 1,
    explanation: 'Mối liên hệ có tính khách quan, phổ biến, đa dạng nên phải xem xét sự vật trong tất cả các mặt, các mối liên hệ — tức quan điểm toàn diện. Quan điểm phát triển rút ra từ nguyên lý về sự phát triển.',
  },
  {
    id: 'P04-q2', room: 'P04', exhibitIds: ['b4-luong-chat'],
    prompt: 'Đun nước tới 100 °C thì nước sôi. Trong quy luật lượng – chất, mốc 100 °C được gọi là gì?',
    options: ['Độ', 'Bước nhảy', 'Chất', 'Điểm nút'],
    answer: 3,
    explanation: 'Điểm nút là thời điểm lượng đổi đủ để làm chất đổi. Độ là khoảng giới hạn mà lượng đổi chưa làm chất đổi; bước nhảy là sự chuyển hóa sang chất mới (nước thành hơi).',
  },
  {
    id: 'P04-q3', room: 'P04', exhibitIds: ['b4-mau-thuan'],
    prompt: 'Theo phép biện chứng duy vật, nguồn gốc và động lực của sự phát triển là gì?',
    options: ['Mâu thuẫn giữa các mặt đối lập', 'Sự tác động của ý thức con người', 'Những sự kiện ngẫu nhiên', 'Sự lặp lại không thay đổi'],
    answer: 0,
    explanation: 'Quy luật thống nhất và đấu tranh của các mặt đối lập: mâu thuẫn là nguồn gốc, động lực của sự phát triển. Thống nhất là tương đối, đấu tranh là tuyệt đối.',
  },
  {
    id: 'P04-q4', room: 'P04', exhibitIds: ['b4-phu-dinh'],
    prompt: 'Quy luật phủ định của phủ định cho thấy sự phát triển diễn ra theo đường nào?',
    options: ['Đường thẳng đi lên', 'Đường tròn khép kín', 'Đường đi xuống', 'Đường xoáy ốc (trôn ốc)'],
    answer: 3,
    explanation: 'Sự vật dường như quay lại điểm xuất phát nhưng ở trình độ cao hơn, nên phát triển theo đường xoáy ốc — "theo đường trôn ốc chứ không theo đường thẳng" (V.I. Lênin).',
  },
  {
    id: 'P04-q5', room: 'P04', exhibitIds: ['b4-rieng-chung'],
    prompt: 'Phát biểu nào đúng về quan hệ giữa cái chung và cái riêng?',
    options: [
      'Cái chung tồn tại độc lập, bên ngoài cái riêng',
      'Cái chung chỉ tồn tại trong cái riêng, thông qua cái riêng',
      'Cái riêng không chứa cái chung nào',
      'Cái đơn nhất và cái chung không bao giờ chuyển hóa cho nhau',
    ],
    answer: 1,
    explanation: 'Cái chung là những thuộc tính lặp lại ở nhiều sự vật và chỉ tồn tại trong cái riêng. Cái đơn nhất và cái chung có thể chuyển hóa cho nhau.',
  },

  // P05
  {
    id: 'P05-q1', room: 'P05', exhibitIds: ['b5-con-duong'],
    prompt: 'Theo V.I. Lênin, con đường biện chứng của nhận thức chân lý là:',
    options: [
      'Từ tư duy trừu tượng đến trực quan sinh động',
      'Từ trực quan sinh động đến tư duy trừu tượng, và từ tư duy trừu tượng đến thực tiễn',
      'Từ thực tiễn đến cảm giác rồi dừng lại',
      'Từ sự hồi tưởng của linh hồn đến khái niệm',
    ],
    answer: 1,
    explanation: 'Nhận thức đi từ cảm tính (trực quan sinh động) lên lý tính (tư duy trừu tượng), rồi trở về thực tiễn để kiểm nghiệm.',
  },
  {
    id: 'P05-q2', room: 'P05', exhibitIds: ['b5-thuc-tien', 'b5-chan-ly'],
    prompt: 'Tiêu chuẩn của chân lý là gì?',
    options: ['Ý kiến của số đông', 'Uy tín của người phát biểu', 'Thực tiễn', 'Sự rõ ràng, mạch lạc của tư duy'],
    answer: 2,
    explanation: 'Thực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý. Chân lý là tri thức phù hợp với hiện thực khách quan và được thực tiễn kiểm nghiệm.',
  },
  {
    id: 'P05-q3', room: 'P05', exhibitIds: ['b5-con-duong'],
    prompt: 'Nhận thức lý tính gồm những hình thức nào?',
    options: ['Cảm giác, tri giác, biểu tượng', 'Tri thức, tình cảm, ý chí', 'Khái niệm, phán đoán, suy lý', 'Tự ý thức, tiềm thức, vô thức'],
    answer: 2,
    explanation: 'Nhận thức lý tính gồm khái niệm, phán đoán, suy lý. Cảm giác, tri giác, biểu tượng là các hình thức của nhận thức cảm tính.',
  },
  {
    id: 'P05-q4', room: 'P05', exhibitIds: ['b5-thuc-tien'],
    prompt: 'Ba hình thức cơ bản của thực tiễn là gì?',
    options: [
      'Sản xuất vật chất, hoạt động chính trị – xã hội, thực nghiệm khoa học',
      'Kinh tế, chính trị, tư tưởng',
      'Lao động, ngôn ngữ, tư duy',
      'Cảm giác, tri giác, biểu tượng',
    ],
    answer: 0,
    explanation: 'Thực tiễn có ba hình thức cơ bản: sản xuất vật chất (chiếc cày), hoạt động chính trị – xã hội (lá cờ) và thực nghiệm khoa học (kính hiển vi).',
  },

  // P06
  {
    id: 'P06-q1', room: 'P06', exhibitIds: ['c6-banh-rang'],
    prompt: 'Lực lượng sản xuất gồm những yếu tố nào?',
    options: ['Quan hệ sở hữu, tổ chức – quản lý, phân phối', 'Người lao động và tư liệu sản xuất', 'Nhà nước và pháp luật', 'Tâm lý xã hội và hệ tư tưởng'],
    answer: 1,
    explanation: 'Lực lượng sản xuất gồm người lao động và tư liệu sản xuất. Quan hệ sở hữu, tổ chức – quản lý và phân phối là các mặt của quan hệ sản xuất.',
  },
  {
    id: 'P06-q2', room: 'P06', exhibitIds: ['c6-banh-rang'],
    prompt: 'Khi quan hệ sản xuất không còn phù hợp với trình độ của lực lượng sản xuất thì:',
    options: [
      'Nó thúc đẩy lực lượng sản xuất phát triển nhanh hơn',
      'Lực lượng sản xuất tự ngừng phát triển vĩnh viễn',
      'Nó trở thành "xiềng xích" kìm hãm lực lượng sản xuất',
      'Không ảnh hưởng gì tới sản xuất',
    ],
    answer: 2,
    explanation: 'Quan hệ sản xuất phù hợp thì thúc đẩy, không phù hợp thì kìm hãm lực lượng sản xuất — như hai bánh răng lệch nhau làm cỗ máy kẹt.',
  },
  {
    id: 'P06-q3', room: 'P06', exhibitIds: ['c6-toa-nha'],
    prompt: 'Cơ sở hạ tầng của xã hội là gì?',
    options: [
      'Hệ thống đường sá, cầu cống, nhà cửa',
      'Các thiết chế chính trị, pháp quyền',
      'Hệ tư tưởng của giai cấp thống trị',
      'Toàn bộ những quan hệ sản xuất hợp thành cơ cấu kinh tế của xã hội',
    ],
    answer: 3,
    explanation: 'Cơ sở hạ tầng là toàn bộ quan hệ sản xuất hợp thành cơ cấu kinh tế; nó quyết định kiến trúc thượng tầng (tư tưởng và thiết chế), còn kiến trúc thượng tầng tác động trở lại.',
  },
  {
    id: 'P06-q4', room: 'P06', exhibitIds: ['c6-nam-hinh-thai'],
    prompt: 'C. Mác coi sự phát triển của các hình thái kinh tế – xã hội là:',
    options: ['Một quá trình lịch sử – tự nhiên', 'Kết quả ý muốn của các vĩ nhân', 'Một vòng tuần hoàn lặp lại', 'Một chuỗi sự kiện ngẫu nhiên, không quy luật'],
    answer: 0,
    explanation: '"Tôi coi sự phát triển của những hình thái kinh tế – xã hội là một quá trình lịch sử – tự nhiên" — nghĩa là tuân theo quy luật khách quan, không theo ý muốn chủ quan.',
  },

  // P07
  {
    id: 'P07-q1', room: 'P07', exhibitIds: ['c7-giai-cap'],
    prompt: 'Nguyên nhân trực tiếp dẫn tới sự ra đời của giai cấp là gì?',
    options: ['Lực lượng sản xuất tạo ra "của dư"', 'Chế độ tư hữu', 'Chiến tranh giữa các bộ lạc', 'Sự khác biệt về ngôn ngữ'],
    answer: 1,
    explanation: 'Nguyên nhân sâu xa là lực lượng sản xuất phát triển tạo ra "của dư"; nguyên nhân trực tiếp là sự xuất hiện chế độ tư hữu.',
  },
  {
    id: 'P07-q2', room: 'P07', exhibitIds: ['c7-dau-tranh'],
    prompt: 'Theo Tuyên ngôn của Đảng Cộng sản, lịch sử tất cả các xã hội tồn tại từ trước đến nay là lịch sử của gì?',
    options: ['Các vương triều', 'Phát triển tôn giáo', 'Các vĩ nhân', 'Đấu tranh giai cấp'],
    answer: 3,
    explanation: '"Lịch sử tất cả các xã hội tồn tại từ trước đến ngày nay chỉ là lịch sử đấu tranh giai cấp." Đấu tranh giai cấp là động lực trực tiếp của lịch sử trong xã hội có giai cấp.',
  },
  {
    id: 'P07-q3', room: 'P07', exhibitIds: ['c7-cong-dong'],
    prompt: 'Trong các hình thức cộng đồng người sau, hình thức nào xuất hiện muộn nhất?',
    options: ['Thị tộc', 'Bộ lạc', 'Dân tộc', 'Bộ tộc'],
    answer: 2,
    explanation: 'Các hình thức cộng đồng người nối tiếp nhau: thị tộc, bộ lạc, bộ tộc, dân tộc.',
  },
  {
    id: 'P07-q4', room: 'P07', exhibitIds: ['c7-giai-cap-dan-toc'],
    prompt: 'Theo Hồ Chí Minh, muốn cứu nước, giải phóng dân tộc phải đi theo con đường nào?',
    options: ['Con đường cách mạng vô sản', 'Con đường cải lương', 'Con đường cách mạng tư sản', 'Dựa vào sự giúp đỡ của ngoại bang'],
    answer: 0,
    explanation: '"Muốn cứu nước, giải phóng dân tộc không có con đường nào khác con đường cách mạng vô sản." Ở nước thuộc địa, giải phóng giai cấp bắt đầu từ giải phóng dân tộc.',
  },

  // P08
  {
    id: 'P08-q1', room: 'P08', exhibitIds: ['c8-nguon-goc'],
    prompt: 'Theo V.I. Lênin, nhà nước xuất hiện khi nào?',
    options: ['Ngay từ khi có loài người', 'Khi những mâu thuẫn giai cấp không thể điều hòa được', 'Khi con người phát minh ra chữ viết', 'Khi dân số vượt quá một mức nhất định'],
    answer: 1,
    explanation: 'Nhà nước là sản phẩm của mâu thuẫn giai cấp không thể điều hòa; về bản chất, nó là tổ chức chính trị của giai cấp thống trị về kinh tế.',
  },
  {
    id: 'P08-q2', room: 'P08', exhibitIds: ['c8-dac-trung'],
    prompt: 'Đâu KHÔNG phải là đặc trưng của nhà nước?',
    options: ['Quản lý dân cư theo lãnh thổ', 'Có bộ máy quyền lực chuyên nghiệp mang tính cưỡng chế', 'Có hệ thống thuế khóa', 'Quản lý dân cư theo huyết thống'],
    answer: 3,
    explanation: 'Nhà nước quản lý dân cư theo lãnh thổ, có bộ máy quyền lực cưỡng chế và có thuế khóa. Quản lý theo huyết thống là đặc điểm của tổ chức thị tộc.',
  },
  {
    id: 'P08-q3', room: 'P08', exhibitIds: ['c8-tinh-the'],
    prompt: 'Tổng khởi nghĩa của Cách mạng Tháng Tám diễn ra trong khoảng thời gian nào?',
    options: ['Từ 9/3 đến 12/3/1945', 'Từ 19/8 đến 2/9/1945', 'Năm 1930 – 1931', 'Năm 1954'],
    answer: 1,
    explanation: 'Tổng khởi nghĩa diễn ra từ 19/8 đến 2/9/1945. Ngày 9/3/1945 Nhật đảo chính Pháp; ngày 12/3/1945 có Chỉ thị "Nhật – Pháp bắn nhau và hành động của chúng ta".',
  },

  // P09
  {
    id: 'P09-q1', room: 'P09', exhibitIds: ['c9-ton-tai'],
    prompt: 'Theo C. Mác, cái gì quyết định ý thức của con người?',
    options: ['Ý chí của các vĩ nhân', 'Tôn giáo', 'Tồn tại xã hội', 'Hệ tư tưởng của thời đại'],
    answer: 2,
    explanation: '"Không phải ý thức của con người quyết định tồn tại của họ; trái lại, tồn tại xã hội của họ quyết định ý thức của họ."',
  },
  {
    id: 'P09-q2', room: 'P09', exhibitIds: ['c9-ket-cau'],
    prompt: 'Hai trình độ của ý thức xã hội là gì?',
    options: ['Khoa học và tôn giáo', 'Tâm lý xã hội và hệ tư tưởng', 'Đạo đức và pháp quyền', 'Cảm giác và tư duy'],
    answer: 1,
    explanation: 'Tâm lý xã hội hình thành tự phát từ đời sống hằng ngày; hệ tư tưởng là hệ thống quan điểm được khái quát thành lý luận.',
  },
  {
    id: 'P09-q3', room: 'P09', exhibitIds: ['c9-doc-lap'],
    prompt: 'Câu "Người chết nắm lấy người sống" minh họa đặc điểm nào của ý thức xã hội?',
    options: ['Thường lạc hậu hơn tồn tại xã hội', 'Luôn vượt trước tồn tại xã hội', 'Không có tính kế thừa', 'Không tác động trở lại tồn tại xã hội'],
    answer: 0,
    explanation: 'Ý thức xã hội có tính độc lập tương đối: thường lạc hậu hơn tồn tại xã hội (tư tưởng cũ còn níu giữ), nhưng cũng có thể vượt trước, có tính kế thừa và tác động trở lại.',
  },

  // P10
  {
    id: 'P10-q1', room: 'P10', exhibitIds: ['c10-ban-chat'],
    prompt: 'Theo C. Mác, trong tính hiện thực của nó, bản chất con người là gì?',
    options: ['Một thực thể thuần túy sinh học', 'Linh hồn bất tử', 'Ý chí tự do tuyệt đối', 'Tổng hòa những quan hệ xã hội'],
    answer: 3,
    explanation: '"Trong tính hiện thực của nó, bản chất con người là tổng hòa những quan hệ xã hội." Con người hình thành và thay đổi trong các quan hệ xã hội cụ thể.',
  },
  {
    id: 'P10-q2', room: 'P10', exhibitIds: ['c10-quan-chung'],
    prompt: 'Ai là chủ thể sáng tạo chân chính của lịch sử?',
    options: ['Quần chúng nhân dân', 'Các lãnh tụ', 'Các nhà triết học', 'Giai cấp thống trị'],
    answer: 0,
    explanation: 'Quần chúng nhân dân là chủ thể sáng tạo chân chính của lịch sử; lãnh tụ dẫn dắt phong trào. Cần chống tệ sùng bái cá nhân.',
  },
  {
    id: 'P10-q3', room: 'P10', exhibitIds: ['c10-tha-hoa'],
    prompt: 'Thực chất của hiện tượng tha hóa con người là gì?',
    options: ['Sự suy giảm thể chất', 'Lao động bị tha hóa', 'Sự xa rời tôn giáo', 'Sự phát triển của khoa học'],
    answer: 1,
    explanation: 'Thực chất của tha hóa là lao động bị tha hóa, nguyên nhân là chế độ tư hữu. Mục tiêu là giải phóng con người.',
  },
];
