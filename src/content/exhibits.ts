import type { Exhibit } from './types';

// Nguồn: docs/NOI_DUNG.md — Giáo trình Triết học Mác – Lênin (2021). Nội dung là tóm tắt;
// chỉ phần `quote` là trích nguyên văn ngắn. Số trang là trang in trong sách.
const GT = 'Giáo trình Triết học Mác – Lênin';
const MAC = 'C. Mác';
const ANGGHEN = 'Ph. Ăngghen';
const MAC_ANGGHEN = 'C. Mác và Ph. Ăngghen';
const LENIN = 'V.I. Lênin';
const HCM = 'Hồ Chí Minh';

export const exhibits: Exhibit[] = [
  // ── Phòng 01 — Triết học và vấn đề cơ bản của triết học
  {
    id: 'a1-ba-cai-noi', room: 'P01', kind: 'text', title: 'Ba cái nôi của triết học', pages: [[12, 20]],
    body: 'Triết học ra đời vào khoảng thế kỷ VIII – VI trước Công nguyên, cùng lúc ở cả phương Đông và phương Tây.\n\nNgười Hy Lạp gọi là philosophia — "yêu mến sự thông thái". Người Trung Quốc dùng chữ triết (哲) — trí tuệ, hiểu biết sâu sắc. Người Ấn Độ gọi là darśana — chiêm ngưỡng, con đường suy ngẫm.\n\nTriết học có hai nguồn gốc. Nguồn gốc nhận thức: con người đạt tới khả năng tư duy trừu tượng, khái quát. Nguồn gốc xã hội: phân công lao động phát triển, lao động trí óc tách khỏi lao động chân tay.',
  },
  {
    id: 'a1-dinh-nghia', room: 'P01', kind: 'text', title: 'Triết học là gì?', pages: [[17, 17], [22, 22]],
    body: 'Triết học trả lời những câu hỏi chung nhất: thế giới là gì, con người đứng ở đâu trong thế giới, và mọi thứ vận động, phát triển theo quy luật nào.\n\nTriết học không đứng ngoài đời sống. C. Mác nhận xét rằng các triết gia "không mọc lên như nấm từ trái đất", họ là sản phẩm của thời đại mình.',
    quote: { text: 'triết học là hệ thống quan điểm lý luận chung nhất về thế giới và vị trí con người trong thế giới đó, là khoa học về những quy luật vận động, phát triển chung nhất của tự nhiên, xã hội và tư duy.', author: GT },
  },
  {
    id: 'a1-the-gioi-quan', room: 'P01', kind: 'model', title: 'Cặp kính thế giới quan', pages: [[23, 30]],
    body: 'Thế giới quan là hệ thống tri thức, niềm tin, lý tưởng về thế giới và về vị trí của con người trong đó; lý tưởng là trình độ cao nhất. Giống như cặp kính, thế giới quan quyết định ta nhìn thế giới ra sao.\n\nCó ba hình thức thế giới quan chính: tôn giáo, khoa học và triết học. Triết học là hạt nhân lý luận của thế giới quan.\n\nThuật ngữ Weltanschauung (thế giới quan) được I. Kant dùng lần đầu năm 1790.',
  },
  {
    id: 'a1-van-de-co-ban', room: 'P01', kind: 'interactive', title: 'Cán cân Vật chất – Ý thức', pages: [[30, 33]],
    body: 'Vấn đề cơ bản của triết học là quan hệ giữa tư duy và tồn tại, tức giữa ý thức và vật chất. Vấn đề này có hai mặt.\n\nMặt thứ nhất: vật chất và ý thức, cái nào có trước, cái nào quyết định cái nào? Trả lời "vật chất" dẫn tới chủ nghĩa duy vật; trả lời "ý thức" dẫn tới chủ nghĩa duy tâm.\n\nMặt thứ hai: con người có khả năng nhận thức được thế giới hay không?',
    quote: { text: 'Vấn đề cơ bản lớn của mọi triết học, đặc biệt là của triết học hiện đại, là vấn đề quan hệ giữa tư duy với tồn tại', author: ANGGHEN },
    interactive: { hint: 'Kéo nghiêng cán cân về phía Vật chất, rồi về phía Ý thức.' },
  },
  {
    id: 'a1-duy-vat-duy-tam', room: 'P01', kind: 'portrait', title: 'Cây hai trường phái', pages: [[33, 37]],
    body: 'Chủ nghĩa duy vật trải qua ba hình thức: chất phác (thời cổ đại), siêu hình (thế kỷ XV – XVIII, xem thế giới như một cỗ máy) và biện chứng (do C. Mác, Ph. Ăngghen sáng lập, V.I. Lênin phát triển).\n\nChủ nghĩa duy tâm có hai dạng: duy tâm chủ quan và duy tâm khách quan.\n\nNhị nguyên luận (tiêu biểu là Descartes) coi vật chất và ý thức song song tồn tại, nhưng xét đến cùng vẫn thuộc về chủ nghĩa duy tâm.',
  },
  {
    id: 'a1-vat-tu-no', room: 'P01', kind: 'model', title: 'Chiếc hộp "vật tự nó"', pages: [[37, 41]],
    body: 'Khả tri luận khẳng định con người nhận thức được thế giới. Bất khả tri luận (Hume, Kant) thì phủ nhận khả năng ấy; thuật ngữ "bất khả tri" do T.H. Huxley đưa ra năm 1869.\n\nKant cho rằng có một "vật tự nó" mà con người không thể biết. Chủ nghĩa duy vật biện chứng trả lời: thông qua thực tiễn, "vật tự nó" dần trở thành "vật cho ta".',
  },
  {
    id: 'a1-cay-va-rung', room: 'P01', kind: 'interactive', title: 'Thấy cây mà không thấy rừng', pages: [[41, 47]],
    body: 'Phương pháp siêu hình xem xét sự vật trong trạng thái cô lập, tĩnh tại, tách rời khỏi các mối liên hệ.\n\nPhương pháp biện chứng xem xét sự vật trong mối liên hệ qua lại và trong sự vận động, phát triển.\n\nPhép biện chứng có ba hình thức: tự phát (thời cổ đại), duy tâm (từ Kant tới Hegel) và duy vật (C. Mác, Ph. Ăngghen).',
    quote: { text: 'chỉ nhìn thấy cây mà không thấy rừng', author: ANGGHEN },
    interactive: { hint: 'Kéo thanh trượt để lùi camera từ một cái cây ra cả khu rừng.' },
  },

  // ── Phòng 02 — Triết học Mác – Lênin và vai trò trong đời sống xã hội
  {
    id: 'a2-dau-may', room: 'P02', kind: 'model', title: 'Đầu máy hơi nước', pages: [[48, 52]],
    body: 'Triết học Mác ra đời trong điều kiện cách mạng công nghiệp phát triển mạnh và giai cấp vô sản bước lên vũ đài chính trị: khởi nghĩa của thợ dệt Lyon (1831, 1834), phong trào Hiến chương ở Anh, khởi nghĩa của thợ dệt Xilêdi (1844).\n\nĐầu máy hơi nước là biểu tượng cho sức sản xuất mới mà xã hội tư bản tạo ra.',
    quote: { text: 'đã tạo ra những lực lượng sản xuất nhiều hơn và đồ sộ hơn lực lượng sản xuất của tất cả các thế hệ trước kia gộp lại', author: MAC_ANGGHEN },
  },
  {
    id: 'a2-ba-nguon-goc', room: 'P02', kind: 'text', title: 'Ba nguồn gốc lý luận, ba phát minh', pages: [[52, 58]],
    body: 'Ba nguồn gốc lý luận của triết học Mác: triết học cổ điển Đức (phép biện chứng của Hegel, chủ nghĩa duy vật của Feuerbach), kinh tế chính trị cổ điển Anh (A. Smith, D. Ricardo) và chủ nghĩa xã hội không tưởng Pháp (Saint-Simon, Fourier).\n\nBa phát minh khoa học tự nhiên làm tiền đề: định luật bảo toàn và chuyển hóa năng lượng, thuyết tế bào và thuyết tiến hóa của Darwin.',
  },
  {
    id: 'a2-mac', room: 'P02', kind: 'portrait', title: 'C. Mác (1818 – 1883)', pages: [[60, 64]],
    image: { src: '/assets/img/mac.webp', credit: 'Ảnh: John Jabez Edwin Mayall, 1875 · phạm vi công cộng · Wikimedia Commons' },
    body: 'C. Mác sinh ngày 5/5/1818 tại Trier (Phổ). Tháng 4/1841 ông nhận bằng tiến sĩ triết học tại Đại học Jena.\n\nNăm 1842 ông làm biên tập viên Nhật báo tỉnh Ranh; cuối năm 1843 sang Paris. Ông mất ngày 14/3/1883.',
  },
  {
    id: 'a2-angghen', room: 'P02', kind: 'portrait', title: 'Ph. Ăngghen (1820 – 1895)', pages: [[59, 59], [64, 66]],
    image: { src: '/assets/img/angghen.webp', credit: 'Ảnh: William Hall, 1877 · phạm vi công cộng · Wikimedia Commons' },
    body: 'Ph. Ăngghen sinh ngày 28/11/1820 tại Barmen. Từ năm 1842 ông sống ở Manchester, chứng kiến phong trào Hiến chương và viết tác phẩm Tình cảnh giai cấp công nhân Anh.\n\nTháng 8/1844 ông gặp C. Mác tại Paris, mở đầu tình bạn và sự cộng tác suốt đời của hai ông.',
    quote: { text: 'những truyền thuyết của đời xưa kể về tình bạn của con người', author: LENIN },
  },
  {
    id: 'a2-ke-sach', room: 'P02', kind: 'interactive', title: 'Kệ sách kinh điển', pages: [[66, 74]],
    body: 'Những tác phẩm đánh dấu quá trình hình thành và phát triển triết học Mác: Bản thảo kinh tế – triết học 1844; Gia đình thần thánh (1845); Luận cương về Phoiơbắc (1845); Hệ tư tưởng Đức (1845 – 1846); Sự khốn cùng của triết học (1847); Tuyên ngôn của Đảng Cộng sản (1848); Tư bản, tập I (1867); Chống Đuyrinh; Nguồn gốc của gia đình, của chế độ tư hữu và của nhà nước (1884); Lútvích Phoiơbắc và sự cáo chung của triết học cổ điển Đức (1886).',
    interactive: { hint: 'Chạm vào ít nhất ba cuốn sách để đọc tóm tắt.' },
  },
  {
    id: 'a2-luan-cuong', room: 'P02', kind: 'text', title: 'Luận cương thứ 11', pages: [[74, 79]],
    body: 'Thực chất cuộc cách mạng trong triết học do C. Mác và Ph. Ăngghen thực hiện: xây dựng chủ nghĩa duy vật biện chứng, rồi vận dụng nó vào nghiên cứu lịch sử để tạo nên chủ nghĩa duy vật lịch sử.\n\nTriết học không chỉ để giải thích mà còn để cải tạo thế giới.',
    quote: { text: 'Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, song vấn đề là cải tạo thế giới.', author: MAC },
  },
  {
    id: 'a2-lenin', room: 'P02', kind: 'portrait', title: 'V.I. Lênin (1870 – 1924)', pages: [[79, 89]],
    image: { src: '/assets/img/lenin.webp', credit: 'Ảnh: Pavel Zhukov, 1920 · phạm vi công cộng · Wikimedia Commons' },
    body: 'V.I. Lênin sinh ngày 22/4/1870 tại Simbirsk. Ông bảo vệ và phát triển triết học Mác trong thời đại đế quốc chủ nghĩa.\n\nCác tác phẩm và dấu mốc tiêu biểu: Chủ nghĩa duy vật và chủ nghĩa kinh nghiệm phê phán (1908), Bút ký triết học (1914 – 1916), Nhà nước và cách mạng (1917), Chính sách kinh tế mới (NEP).',
  },
  {
    id: 'a2-viet-nam', room: 'P02', kind: 'text', title: 'Ánh sáng soi đường ở Việt Nam', pages: [[89, 93]],
    body: 'Chủ nghĩa Mác – Lênin là nền tảng tư tưởng soi đường cho cách mạng Việt Nam qua các mốc: Cương lĩnh năm 1930, Cách mạng Tháng Tám năm 1945, thắng lợi năm 1954 và năm 1975, công cuộc Đổi mới.',
  },
  {
    id: 'a2-chuc-nang', room: 'P02', kind: 'text', title: 'Thế giới quan và phương pháp luận', pages: [[95, 108]],
    body: 'Triết học Mác – Lênin có hai chức năng cơ bản: chức năng thế giới quan và chức năng phương pháp luận.\n\nTriết học không phải "đơn thuốc vạn năng" giải đáp sẵn mọi vấn đề; nó cho ta cách nhìn và cách tiếp cận để tự tìm lời giải.',
    quote: { text: 'Triết học Mác – Lênin là hệ thống quan điểm duy vật biện chứng về tự nhiên, xã hội và tư duy – thế giới quan và phương pháp luận khoa học, cách mạng của giai cấp công nhân, nhân dân lao động và các lực lượng xã hội tiến bộ trong nhận thức và cải tạo thế giới.', author: GT },
  },

  // ── Phòng 03 — Vật chất và ý thức
  {
    id: 'b3-ban-nguyen', room: 'P03', kind: 'model', title: 'Đi tìm bản nguyên thế giới', pages: [[119, 121]],
    body: 'Người xưa tìm "bản nguyên" của thế giới trong những dạng vật chất cụ thể. Năm bục là năm câu trả lời: nước (Thales), lửa (Heraclitus), không khí (Anaximenes), Ngũ hành (Trung Hoa) và Apeirôn — cái vô hạn, không xác định (Anaximander).',
  },
  {
    id: 'b3-nguyen-tu', room: 'P03', kind: 'model', title: 'Từ nguyên tử đến điện tử', pages: [[121, 128]],
    body: 'Leucippus và Democritos cho rằng nguyên tử là hạt nhỏ nhất, không thể phân chia.\n\nCuộc cách mạng trong vật lý cuối thế kỷ XIX – đầu thế kỷ XX đã thay đổi điều đó: Röntgen tìm ra tia X (1895), Becquerel phát hiện phóng xạ (1896), Thomson tìm ra điện tử (1897), ông bà Curie tìm ra pôlôni và radium (1898 – 1902), Einstein đưa ra thuyết tương đối (1905, 1916).',
    quote: { text: 'Điện tử cũng vô cùng tận như nguyên tử; tự nhiên là vô tận', author: LENIN },
  },
  {
    id: 'b3-dinh-nghia', room: 'P03', kind: 'text', title: 'Định nghĩa vật chất của Lênin', pages: [[128, 134]],
    body: 'Hiện vật trung tâm của phòng. Định nghĩa của V.I. Lênin có ba nội dung chính: vật chất là thực tại khách quan, tồn tại không lệ thuộc vào cảm giác; vật chất gây nên cảm giác khi tác động vào giác quan; cảm giác, tư duy, ý thức là sự phản ánh của vật chất.\n\nĐịnh nghĩa này giải quyết đúng đắn cả hai mặt của vấn đề cơ bản của triết học và mở đường cho khoa học đi sâu nghiên cứu thế giới vật chất.',
    quote: { text: 'Vật chất là một phạm trù triết học dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác, được cảm giác của chúng ta chép lại, chụp lại, phản ánh, và tồn tại không lệ thuộc vào cảm giác.', author: LENIN },
  },
  {
    id: 'b3-van-dong', room: 'P03', kind: 'interactive', title: 'Năm bậc thang vận động', pages: [[134, 141]],
    body: 'Vận động là phương thức tồn tại của vật chất. Ph. Ăngghen chia năm hình thức vận động cơ bản, từ thấp đến cao: cơ học, vật lý, hóa học, sinh học và xã hội.\n\nHình thức vận động cao bao hàm các hình thức thấp nhưng không thể quy về chúng. Đứng im chỉ là tương đối, tạm thời.',
    interactive: { hint: 'Chạm lần lượt năm bậc thang, từ thấp lên cao.' },
  },
  {
    id: 'b3-khong-gian', room: 'P03', kind: 'model', title: 'Đồng hồ và quả cầu', pages: [[141, 146]],
    body: 'Không gian và thời gian là những hình thức tồn tại của vật chất: không có vật chất nào tồn tại ngoài không gian và thời gian.\n\nTính thống nhất của thế giới không ở sự tồn tại của nó mà ở tính vật chất của nó.',
    quote: { text: '…vật chất đang vận động không thể vận động ở đâu ngoài không gian và thời gian', author: LENIN },
  },
  {
    id: 'b3-nguon-goc-y-thuc', room: 'P03', kind: 'model', title: 'Bộ óc và chiếc rìu đá', pages: [[146, 156]],
    body: 'Ý thức có hai nguồn gốc. Nguồn gốc tự nhiên: bộ óc người cùng với hoạt động phản ánh thế giới khách quan. Nguồn gốc xã hội: lao động và ngôn ngữ.\n\nBộ óc tượng trưng cho nguồn gốc tự nhiên, chiếc rìu đá cho nguồn gốc xã hội.',
    quote: { text: 'Trước hết là lao động; sau lao động và đồng thời với lao động là ngôn ngữ…', author: ANGGHEN },
  },
  {
    id: 'b3-tam-guong', room: 'P03', kind: 'interactive', title: 'Tấm gương sáng tạo', pages: [[156, 167]],
    body: 'Ý thức là hình ảnh chủ quan của thế giới khách quan. Khác tấm gương thường, sự phản ánh của ý thức là tích cực và sáng tạo.\n\nKết cấu theo các yếu tố: tri thức, tình cảm, ý chí. Theo chiều sâu: tự ý thức, tiềm thức, vô thức.\n\nMáy tính và "trí tuệ nhân tạo" không có ý thức, vì ý thức mang bản chất xã hội.',
    interactive: { hint: 'Di chuyển vật trước tấm gương và xem ảnh phản chiếu đổi theo.' },
  },
  {
    id: 'b3-quan-he', room: 'P03', kind: 'text', title: 'Vật chất quyết định, ý thức tác động trở lại', pages: [[167, 182]],
    body: 'Vật chất quyết định ý thức; ý thức có tính độc lập tương đối và tác động trở lại vật chất thông qua hoạt động thực tiễn của con người.\n\nBài học phương pháp luận: tôn trọng khách quan, đồng thời phát huy tính năng động chủ quan; chống bệnh chủ quan duy ý chí, chống thái độ thụ động, ỷ lại.',
    quote: { text: 'lý luận cũng sẽ trở thành lực lượng vật chất, một khi nó thâm nhập vào quần chúng', author: MAC },
  },

  // ── Phòng 04 — Phép biện chứng duy vật
  {
    id: 'b4-lien-he', room: 'P04', kind: 'interactive', title: 'Màng lưới liên hệ', pages: [[188, 195]],
    body: 'Nguyên lý về mối liên hệ phổ biến: các mối liên hệ giữa sự vật, hiện tượng mang tính khách quan, phổ biến và đa dạng.\n\nTừ nguyên lý này rút ra quan điểm toàn diện: xem xét sự vật trong tất cả các mặt, các mối liên hệ của nó.',
    quote: { text: 'cần phải nhìn bao quát và nghiên cứu tất cả các mặt, tất cả các mối liên hệ…', author: LENIN },
    interactive: { hint: 'Chạm vào một nút bất kỳ để thấy cả mạng lưới rung theo.' },
  },
  {
    id: 'b4-phat-trien', room: 'P04', kind: 'model', title: 'Đường đi lên của sự phát triển', pages: [[195, 202]],
    body: 'Nguyên lý về sự phát triển. Từ đó rút ra quan điểm phát triển: nhìn sự vật trong sự vận động đi lên, chống tư tưởng bảo thủ, trì trệ.',
    quote: { text: 'Phát triển là quá trình vận động từ thấp đến cao, từ kém hoàn thiện đến hoàn thiện hơn, từ chất cũ đến chất mới ở trình độ cao hơn', author: GT },
  },
  {
    id: 'b4-rieng-chung', room: 'P04', kind: 'model', title: 'Cái riêng – Cái chung', pages: [[203, 210]],
    body: 'Cái riêng là một sự vật, hiện tượng cụ thể. Cái chung là những mặt, thuộc tính lặp lại ở nhiều sự vật.\n\nCái chung chỉ tồn tại trong cái riêng, thông qua cái riêng. Cái đơn nhất và cái chung có thể chuyển hóa cho nhau.',
  },
  {
    id: 'b4-nhan-qua', room: 'P04', kind: 'interactive', title: 'Nguyên nhân – Kết quả', pages: [[210, 216]],
    body: 'Nguyên nhân là sự tương tác giữa các mặt trong một sự vật hoặc giữa các sự vật, gây ra biến đổi. Kết quả là những biến đổi do sự tương tác đó tạo ra.\n\nChuỗi domino cho thấy kết quả của bước này lại trở thành nguyên nhân của bước sau.',
    quote: { text: 'hoạt động của con người là hòn đá thử vàng của tính nhân quả', author: ANGGHEN },
    interactive: { hint: 'Đẩy quân domino đầu tiên.' },
  },
  {
    id: 'b4-tat-nhien', room: 'P04', kind: 'interactive', title: 'Tất nhiên – Ngẫu nhiên', pages: [[216, 221]],
    body: 'Cái tất nhiên do nguyên nhân bên trong của sự vật quyết định, trong điều kiện nhất định phải xảy ra như thế. Cái ngẫu nhiên do nguyên nhân bên ngoài, có thể xảy ra hoặc không.\n\nTừng lần thả xúc xắc là ngẫu nhiên, nhưng qua nhiều lần, cái tất nhiên dần lộ ra: cái tất nhiên vạch đường đi cho mình qua vô số cái ngẫu nhiên.',
    interactive: { hint: 'Thả xúc xắc ít nhất năm lần.' },
  },
  {
    id: 'b4-noi-dung', room: 'P04', kind: 'model', title: 'Nội dung – Hình thức', pages: [[221, 225]],
    body: 'Nội dung là tổng hợp các mặt, yếu tố, quá trình tạo nên sự vật; hình thức là phương thức tồn tại và phát triển của sự vật.\n\nNội dung quyết định hình thức. Hình thức phù hợp thì thúc đẩy nội dung phát triển, không phù hợp thì kìm hãm.',
  },
  {
    id: 'b4-ban-chat', room: 'P04', kind: 'model', title: 'Bản chất – Hiện tượng', pages: [[225, 230]],
    body: 'Bản chất là tổng hợp những mặt, mối liên hệ tất nhiên, tương đối ổn định bên trong sự vật. Hiện tượng là sự biểu hiện ra bên ngoài của bản chất.\n\nBản chất và hiện tượng thống nhất nhưng không trùng khít — vì thế mới cần khoa học.',
    quote: { text: 'nếu hình thái biểu hiện và bản chất của sự vật trực tiếp đồng nhất với nhau, thì mọi khoa học sẽ trở nên thừa', author: MAC },
  },
  {
    id: 'b4-kha-nang', room: 'P04', kind: 'model', title: 'Khả năng – Hiện thực', pages: [[230, 234]], illustrative: true,
    body: 'Khả năng là cái chưa xảy ra nhưng sẽ xảy ra khi có đủ điều kiện. Hiện thực là cái đang tồn tại thực sự.\n\nHạt giống mang khả năng trở thành cái cây; khi có đất, nước, ánh sáng, khả năng ấy trở thành hiện thực.',
  },
  {
    id: 'b4-luong-chat', room: 'P04', kind: 'interactive', title: 'Lượng đổi – Chất đổi', pages: [[237, 246]], illustrative: true,
    body: 'Chất là tính quy định vốn có làm sự vật là nó; lượng là tính quy định về quy mô, số lượng, trình độ. Độ là khoảng giới hạn mà lượng thay đổi chưa làm chất đổi. Điểm nút là thời điểm lượng đổi đủ để chất đổi. Bước nhảy là sự chuyển hóa sang chất mới.\n\nĐun ấm nước: nhiệt độ tăng dần trong độ, tới 100 °C (điểm nút) thì nước sôi, chuyển thành hơi (bước nhảy).\n\nVí dụ trong giáo trình: kim cương và than chì cùng là carbon nhưng kết cấu khác nhau nên chất khác nhau.',
    interactive: { hint: 'Kéo thanh nhiệt độ để đun nước.' },
  },
  {
    id: 'b4-mau-thuan', room: 'P04', kind: 'model', title: 'Sự thống nhất và đấu tranh của các mặt đối lập', pages: [[246, 252]], illustrative: true,
    body: 'Thanh nam châm có hai cực đối lập không tách rời nhau. Mâu thuẫn là nguồn gốc, động lực của sự phát triển.\n\nSự thống nhất của các mặt đối lập chỉ là tương đối, tạm thời; sự đấu tranh của chúng là tuyệt đối.',
    quote: { text: 'Sự phát triển là một cuộc "đấu tranh" giữa các mặt đối lập', author: LENIN },
  },
  {
    id: 'b4-phu-dinh', room: 'P04', kind: 'model', title: 'Phủ định của phủ định', pages: [[252, 257]], illustrative: true,
    body: 'Hạt thóc nảy mầm thành cây lúa (phủ định lần thứ nhất), cây lúa lại cho nhiều hạt thóc (phủ định của phủ định). Sự vật dường như quay về điểm xuất phát nhưng ở trình độ cao hơn.\n\nPhát triển diễn ra theo đường xoáy ốc, có kế thừa và có tính chu kỳ.',
    quote: { text: 'sự phát triển có thể nói là theo đường trôn ốc chứ không theo đường thẳng', author: LENIN },
  },

  // ── Phòng 05 — Lý luận nhận thức
  {
    id: 'b5-quan-niem', room: 'P05', kind: 'text', title: 'Những câu trả lời trước Mác', pages: [[257, 262]],
    body: 'Plato cho rằng nhận thức là sự hồi tưởng của linh hồn. Berkeley và Mach coi sự vật là "phức hợp cảm giác". Hume hoài nghi khả năng nhận thức; Kant dựng lên "vật tự nó" không thể biết.\n\nC. Mác phê phán chủ nghĩa duy vật cũ vì chỉ hiểu hiện thực dưới hình thức trực quan, không hiểu nó là hoạt động thực tiễn.',
  },
  {
    id: 'b5-thuc-tien', room: 'P05', kind: 'model', title: 'Ba hình thức thực tiễn', pages: [[265, 273]],
    body: 'Chiếc cày, lá cờ và kính hiển vi tượng trưng cho ba hình thức cơ bản của thực tiễn: sản xuất vật chất, hoạt động chính trị – xã hội và thực nghiệm khoa học.\n\nThực tiễn là cơ sở, động lực, mục đích của nhận thức và là tiêu chuẩn của chân lý.',
    quote: { text: 'thực tiễn là toàn bộ những hoạt động vật chất – cảm tính, có tính lịch sử – xã hội của con người nhằm cải tạo tự nhiên và xã hội phục vụ nhân loại tiến bộ', author: GT },
  },
  {
    id: 'b5-con-duong', room: 'P05', kind: 'interactive', title: 'Con đường biện chứng của nhận thức', pages: [[273, 279]],
    body: 'Nhận thức cảm tính gồm cảm giác, tri giác và biểu tượng. Nhận thức lý tính gồm khái niệm, phán đoán và suy lý.\n\nNhận thức đi từ cảm tính lên lý tính rồi quay về thực tiễn để kiểm nghiệm.',
    quote: { text: 'Từ trực quan sinh động đến tư duy trừu tượng, và từ tư duy trừu tượng đến thực tiễn…', author: LENIN },
    interactive: { hint: 'Đi qua ba chặng: trực quan sinh động, tư duy trừu tượng, thực tiễn.' },
  },
  {
    id: 'b5-chan-ly', room: 'P05', kind: 'model', title: 'Chân lý', pages: [[279, 283]],
    body: 'Chân lý là tri thức phù hợp với hiện thực khách quan và được thực tiễn kiểm nghiệm.\n\nChân lý có tính khách quan, vừa có tính tương đối vừa có tính tuyệt đối, và luôn có tính cụ thể.',
    quote: { text: 'Không có chân lý trừu tượng, chân lý luôn là cụ thể', author: LENIN },
  },

  // ── Phòng 06 — Học thuyết hình thái kinh tế – xã hội
  {
    id: 'c6-san-xuat', room: 'P06', kind: 'text', title: 'Ăn, uống, ở, mặc trước đã', pages: [[286, 293]],
    body: 'Sản xuất vật chất là cơ sở cho sự tồn tại và phát triển của xã hội loài người. Trước khi làm chính trị, khoa học, nghệ thuật hay tôn giáo, con người phải sản xuất ra của cải để sống.',
    quote: { text: 'cần phải ăn, uống, ở và mặc, nghĩa là phải lao động, trước khi có thể đấu tranh để giành quyền thống trị…', author: ANGGHEN },
  },
  {
    id: 'c6-coi-xay', room: 'P06', kind: 'model', title: 'Cối xay tay và cối xay hơi nước', pages: [[300, 300]],
    body: 'Công cụ sản xuất thay đổi kéo theo quan hệ giữa người với người trong sản xuất thay đổi, và cả xã hội thay đổi theo.',
    quote: { text: 'Cái cối xay quay bằng tay đưa lại xã hội có lãnh chúa, các cối xay chạy bằng hơi nước đưa lại xã hội có nhà tư bản công nghiệp', author: MAC },
  },
  {
    id: 'c6-banh-rang', room: 'P06', kind: 'interactive', title: 'Bánh răng LLSX – QHSX', pages: [[293, 306]],
    body: 'Lực lượng sản xuất gồm người lao động và tư liệu sản xuất. Quan hệ sản xuất gồm quan hệ sở hữu, quan hệ tổ chức – quản lý và quan hệ phân phối.\n\nHai bánh răng khớp nhau thì cỗ máy chạy; lệch nhau thì kẹt — khi đó quan hệ sản xuất trở thành "xiềng xích" kìm hãm lực lượng sản xuất. Đây là quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất.',
    interactive: { hint: 'Xoay bánh răng, rồi chuyển giữa chế độ "khớp" và "lệch".' },
  },
  {
    id: 'c6-toa-nha', room: 'P06', kind: 'model', title: 'Móng nhà và tầng trên', pages: [[306, 316]],
    body: 'Cơ sở hạ tầng là toàn bộ những quan hệ sản xuất hợp thành cơ cấu kinh tế của xã hội. Kiến trúc thượng tầng là các quan điểm tư tưởng cùng những thiết chế tương ứng.\n\nCơ sở hạ tầng quyết định kiến trúc thượng tầng; kiến trúc thượng tầng tác động trở lại cơ sở hạ tầng.',
    quote: { text: 'Cơ sở kinh tế thay đổi thì toàn bộ cái kiến trúc thượng tầng đồ sộ cũng bị đảo lộn ít nhiều nhanh chóng', author: MAC },
  },
  {
    id: 'c6-nam-hinh-thai', room: 'P06', kind: 'portrait', title: 'Năm hình thái kinh tế – xã hội', pages: [[316, 329]],
    body: 'Dòng thời gian của lịch sử: cộng sản nguyên thủy, chiếm hữu nô lệ, phong kiến, tư bản chủ nghĩa, cộng sản chủ nghĩa.\n\nViệt Nam quá độ lên chủ nghĩa xã hội, bỏ qua chế độ tư bản chủ nghĩa.',
    quote: { text: 'Tôi coi sự phát triển của những hình thái kinh tế – xã hội là một quá trình lịch sử – tự nhiên', author: MAC },
  },

  // ── Phòng 07 — Giai cấp và dân tộc
  {
    id: 'c7-giai-cap', room: 'P07', kind: 'text', title: 'Định nghĩa giai cấp', pages: [[330, 340]],
    body: 'Định nghĩa trong tác phẩm Sáng kiến vĩ đại của V.I. Lênin chỉ ra rằng sự khác nhau về địa vị trong hệ thống sản xuất là căn cứ phân chia giai cấp.\n\nNguyên nhân sâu xa của sự ra đời giai cấp là lực lượng sản xuất phát triển tạo ra "của dư"; nguyên nhân trực tiếp là chế độ tư hữu.',
    quote: { text: 'những tập đoàn người to lớn, khác nhau về địa vị của họ trong một hệ thống sản xuất xã hội nhất định trong lịch sử…', author: LENIN },
  },
  {
    id: 'c7-dau-tranh', room: 'P07', kind: 'text', title: 'Đấu tranh giai cấp', pages: [[341, 361]],
    body: 'Đấu tranh giai cấp là động lực trực tiếp của lịch sử trong xã hội có giai cấp.\n\nGiai cấp vô sản có ba hình thức đấu tranh: kinh tế, chính trị (hình thức cao nhất) và tư tưởng.',
    quote: { text: 'Lịch sử tất cả các xã hội tồn tại từ trước đến ngày nay chỉ là lịch sử đấu tranh giai cấp.', author: MAC_ANGGHEN },
  },
  {
    id: 'c7-cong-dong', room: 'P07', kind: 'model', title: 'Từ thị tộc đến dân tộc', pages: [[362, 366]],
    body: 'Bốn mô hình nối tiếp nhau là bốn hình thức cộng đồng người trong lịch sử: thị tộc, bộ lạc, bộ tộc và dân tộc.',
  },
  {
    id: 'c7-dan-toc', room: 'P07', kind: 'text', title: 'Dân tộc và năm đặc trưng', pages: [[366, 374]],
    body: 'Dân tộc có năm đặc trưng: chung lãnh thổ; chung ngôn ngữ; chung đời sống kinh tế; chung văn hóa, tâm lý; chung nhà nước và pháp luật.\n\nDân tộc Việt Nam hình thành rất sớm, gắn với quá trình dựng nước và giữ nước, từ khi Đại Việt giành độc lập tới thời Lý – Trần.',
  },
  {
    id: 'c7-giai-cap-dan-toc', room: 'P07', kind: 'text', title: 'Giai cấp – Dân tộc – Nhân loại', pages: [[374, 384]],
    body: 'Áp bức giai cấp là nguyên nhân căn bản của áp bức dân tộc. Ở các nước thuộc địa, giải phóng giai cấp phải bắt đầu từ giải phóng dân tộc.',
    quote: { text: 'Muốn cứu nước, giải phóng dân tộc không có con đường nào khác con đường cách mạng vô sản', author: HCM },
  },

  // ── Phòng 08 — Nhà nước và cách mạng xã hội
  {
    id: 'c8-nguon-goc', room: 'P08', kind: 'text', title: 'Nhà nước từ đâu ra?', pages: [[385, 390]],
    body: 'Theo V.I. Lênin, nhà nước xuất hiện ở đâu và khi nào mà "những mâu thuẫn giai cấp không thể điều hòa được".\n\nVề bản chất, nhà nước là tổ chức chính trị của giai cấp thống trị về kinh tế.',
    quote: { text: 'Nhà nước là sản phẩm của một xã hội đã phát triển tới một giai đoạn nhất định', author: ANGGHEN },
  },
  {
    id: 'c8-dac-trung', room: 'P08', kind: 'model', title: 'Lãnh thổ, quyền lực, thuế', pages: [[390, 396]],
    body: 'Ba đặc trưng của nhà nước: quản lý dân cư theo lãnh thổ (khác với tổ chức thị tộc quản lý theo huyết thống); có bộ máy quyền lực chuyên nghiệp mang tính cưỡng chế; có hệ thống thuế khóa để nuôi bộ máy.\n\nCác cặp chức năng: thống trị chính trị và xã hội; đối nội và đối ngoại.',
  },
  {
    id: 'c8-kieu-nha-nuoc', room: 'P08', kind: 'portrait', title: 'Bốn kiểu nhà nước', pages: [[396, 402]],
    body: 'Lịch sử có bốn kiểu nhà nước: chủ nô (Xpác theo hình thức quân chủ, Aten theo hình thức cộng hòa dân chủ), phong kiến, tư sản và vô sản.\n\nNhà nước kiểu mới: Công xã Pari (1871), nhà nước Xôviết (1917), nước Việt Nam Dân chủ Cộng hòa (1945).',
  },
  {
    id: 'c8-phap-quyen', room: 'P08', kind: 'text', title: 'Nhà nước pháp quyền XHCN Việt Nam', pages: [[402, 405]],
    body: 'Xây dựng Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam theo nguyên tắc "Đảng lãnh đạo, Nhà nước quản lý, nhân dân làm chủ".',
    quote: { text: 'Nhà nước của nhân dân, do nhân dân và vì nhân dân', author: 'Văn kiện Đại hội XIII' },
  },
  {
    id: 'c8-tinh-the', room: 'P08', kind: 'interactive', title: 'Tình thế và thời cơ cách mạng', pages: [[405, 417]],
    body: 'V.I. Lênin nêu ba dấu hiệu của tình thế cách mạng.\n\nThời cơ của Cách mạng Tháng Tám: Nhật đảo chính Pháp (9/3/1945); Chỉ thị "Nhật – Pháp bắn nhau và hành động của chúng ta" (12/3/1945); nạn đói làm hơn 2 triệu người chết; Tổng khởi nghĩa từ 19/8 đến 2/9/1945.',
    quote: { text: 'Giờ quyết định cho vận mệnh dân tộc ta đã đến…', author: HCM },
    interactive: { hint: 'Chạm các mốc thời gian năm 1945 theo đúng thứ tự.' },
  },

  // ── Phòng 09 — Ý thức xã hội
  {
    id: 'c9-ton-tai', room: 'P09', kind: 'text', title: 'Tồn tại quyết định ý thức', pages: [[419, 421]],
    body: 'Tồn tại xã hội là toàn bộ sinh hoạt vật chất và điều kiện sinh hoạt vật chất của xã hội, gồm phương thức sản xuất, điều kiện tự nhiên và dân số. Tồn tại xã hội quyết định ý thức xã hội.',
    quote: { text: 'Không phải ý thức của con người quyết định tồn tại của họ; trái lại, tồn tại xã hội của họ quyết định ý thức của họ', author: MAC },
  },
  {
    id: 'c9-ket-cau', room: 'P09', kind: 'model', title: 'Tâm lý xã hội và hệ tư tưởng', pages: [[422, 427]],
    body: 'Ý thức xã hội có hai trình độ: tâm lý xã hội (tình cảm, thói quen, tập quán hình thành tự phát) và hệ tư tưởng (hệ thống quan điểm được khái quát thành lý luận).\n\nTrong xã hội có giai cấp, ý thức xã hội mang tính giai cấp.',
    quote: { text: 'những tư tưởng của giai cấp thống trị là những tư tưởng thống trị', author: MAC_ANGGHEN },
  },
  {
    id: 'c9-bay-cot', room: 'P09', kind: 'interactive', title: 'Bảy hình thái ý thức xã hội', pages: [[427, 440]],
    body: 'Bảy cột là bảy hình thái ý thức xã hội: chính trị, pháp quyền, đạo đức, thẩm mỹ, tôn giáo, khoa học và triết học. Mỗi hình thái phản ánh một mặt của tồn tại xã hội theo cách riêng.',
    interactive: { hint: 'Chạm vào từng cột trong bảy cột.' },
  },
  {
    id: 'c9-doc-lap', room: 'P09', kind: 'text', title: 'Tính độc lập tương đối', pages: [[440, 447]],
    body: 'Ý thức xã hội thường lạc hậu hơn tồn tại xã hội, nhưng cũng có thể vượt trước. Nó có tính kế thừa; các hình thái ý thức xã hội tác động qua lại lẫn nhau và tác động trở lại tồn tại xã hội.',
    quote: { text: 'Người chết nắm lấy người sống', author: MAC },
  },

  // ── Phòng 10 — Triết học về con người
  {
    id: 'c10-sinh-hoc-xa-hoi', room: 'P10', kind: 'model', title: 'Thực thể sinh học – xã hội', pages: [[447, 454]],
    body: 'Con người vừa là một bộ phận của tự nhiên, vừa là một thực thể xã hội. Lao động là yếu tố tách con người khỏi loài vật.',
    quote: { text: 'loài vượn may mắn lắm chỉ hái lượm trong khi con người lại sản xuất', author: ANGGHEN },
  },
  {
    id: 'c10-ban-chat', room: 'P10', kind: 'text', title: 'Bản chất con người', pages: [[456, 456]],
    body: 'Luận điểm nổi tiếng của C. Mác trong Luận cương về Phoiơbắc: con người không phải một bản chất trừu tượng, cố định, mà được hình thành và thay đổi trong các quan hệ xã hội cụ thể.',
    quote: { text: 'Trong tính hiện thực của nó, bản chất con người là tổng hòa những quan hệ xã hội.', author: MAC },
  },
  {
    id: 'c10-tha-hoa', room: 'P10', kind: 'model', title: 'Tha hóa và giải phóng', pages: [[457, 464]],
    body: 'Thực chất của tha hóa là lao động bị tha hóa: con người bị chính sản phẩm lao động của mình chi phối. Nguyên nhân là chế độ tư hữu.\n\nMục tiêu cao cả là giải phóng con người.',
    quote: { text: 'Sự phát triển tự do của mỗi người là điều kiện cho sự phát triển tự do của tất cả mọi người', author: MAC_ANGGHEN },
  },
  {
    id: 'c10-quan-chung', room: 'P10', kind: 'text', title: 'Quần chúng và lãnh tụ', pages: [[465, 477]],
    body: 'Quần chúng nhân dân là chủ thể sáng tạo chân chính của lịch sử. Lãnh tụ là người dẫn dắt phong trào.\n\nCần chống tệ sùng bái cá nhân.',
  },
  {
    id: 'c10-ho-chi-minh', room: 'P10', kind: 'portrait', title: 'Hồ Chí Minh về con người', pages: [[478, 489]],
    image: { src: '/assets/img/ho-chi-minh.webp', credit: 'Ảnh: Hồ Chí Minh năm 1946, không rõ tác giả · phạm vi công cộng · Wikimedia Commons' },
    body: 'Hồ Chí Minh đặt con người vào vị trí trung tâm: "Nước độc lập mà dân không hưởng hạnh phúc tự do, thì độc lập cũng chẳng có nghĩa lý gì".\n\nCon người toàn diện phải có cả đức và tài, trong đó đức là gốc.',
    quote: { text: 'Vì lợi ích mười năm thì phải trồng cây, vì lợi ích trăm năm thì phải trồng người', author: HCM },
  },
];
