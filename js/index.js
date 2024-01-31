//참고) https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001

$(function() {
    $( "#startDate" ).datepicker({
        dateFormat: 'yy.mm.dd'
    });
    $( "#endDate" ).datepicker({
        dateFormat: 'yy.mm.dd'
    });

    $('select').niceSelect(); // 나이스 셀렉트 세팅
});

// 페이지당 표시할 아이템 수
const itemsPerPage = 10;
// 현재 페이지
let currentPage = 1;

// url에 들어가는 날짜를 yyyymmdd 형식으로 변환하는 함수
const formatDateToYyyymmdd = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
}

// 전역 변수로 startDate와 endDate 선언
let startDate, endDate;

// OpenDart API 사용을 위한 스크립트
const openDartApi = (page) => {
    // API 요청에 필요한 파라미터
    const crtfc_key = "d8766b6344b76c2a1c1cbcd15598b2ca2472ec8a";
    const corp_code = "00126380";
    const bgn_de = startDate;
    const end_de = endDate;
    const page_count = itemsPerPage;
    const page_no = page || 1;

    // 공시유형 선택 값 가져오기
    const selectedPblntfTy = $("#periodCate").val();
    // 검색 버튼을 눌렀을 때만 pblntf_ty 값을 설정 + 공시유형 선택 option일 때는 변수 빈칸
    const pblntf_ty = selectedPblntfTy && selectedPblntfTy !== "none" ? `&pblntf_ty=${selectedPblntfTy}` : '';

    // API 요청 URL
    const localUrl = `https://cors-anywhere.herokuapp.com/https://opendart.fss.or.kr/api/list.json?crtfc_key=${crtfc_key}&corp_code=${corp_code}&bgn_de=${bgn_de}&end_de=${end_de}&page_count=${page_count}&page_no=${page_no}${pblntf_ty}`;
    // console.log(pblntf_ty, apiUrl)

    // Axios를 사용하여 API 요청
    axios
    .get(localUrl)
    .then((response) => {
        const object = JSON.parse(response.data.response);

        if (object.message === "정상") {
            // 정상적인 응답인 경우 테이블과 페이지네이션을 업데이트
            displayTable(object.list, object.total_count);
            displayPagination(object.total_page);
        } else {
            // 정상적이지 않은 경우 경고 메시지 출력 및 홈페이지로 이동
            if (object.message !== "조회된 데이타가 없습니다.") {
                alert("비정상적인 접근입니다.");
                location.href = "/disclosure_info4";
            } else {
                // 검색 결과가 없는 경우
                displayTable([], 0);
                displayPagination(0);
            }
        }
    })
    .catch((error) => {
        console.log(`error ${error}`);
    });
}

// 다른 옵션인 경우 startDate 설정을 담당하는 함수(셀렉트 옵션에 따른 날짜 계산)
const setStartDateByOption = (option, today) => {
    switch (option) {
        case "1":
            return new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        case "3":
            return new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        case "6":
            return new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        case "12":
            return new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        case "all":
            return new Date("1999-01-01");
        default:
            return today;
    }
};

// 선택한 기간에 따라 시작일과 종료일 설정
const searchByPeriod = () => {
    const selectedBox = document.getElementById("period");
    const selectedOption = selectedBox.value;
    
    if (selectedOption === "custom") {
        // "직접 선택" 옵션을 선택한 경우
        const selectedStartDate = $("#startDate").datepicker("getDate");
        const selectedEndDate = $("#endDate").datepicker("getDate");

        // 밖에 있는 datepicker 설정 지우기
        $("#startDate").datepicker("destroy");
        $("#endDate").datepicker("destroy");

        // "직접 선택" 옵션인 경우에만 onSelect 함수 추가
        $("#startDate").datepicker({
            dateFormat: 'yy.mm.dd',
            onSelect: function () {
                searchByPeriod();
            }
        });

        $("#endDate").datepicker({
            dateFormat: 'yy.mm.dd',
            onSelect: function () {
                searchByPeriod();
            }
        });
        
        $('.selectDateBox').addClass('on'); //직접 선택인 경우에만 on 추가

        if (selectedStartDate && selectedEndDate) {
            startDate = formatDateToYyyymmdd(selectedStartDate);
            endDate = formatDateToYyyymmdd(selectedEndDate);

        } else {
            alert("시작일과 종료일을 선택하세요.");
            return; // 날짜가 선택되지 않았을 경우 함수 종료
        }

    }else{
        // 다른 옵션인 경우
        const today = new Date();
        endDate = formatDateToYyyymmdd(today);
        startDate = formatDateToYyyymmdd(setStartDateByOption(selectedOption, today));

        // 날짜 형식 변환 (YYYYMMDD -> YYYY.MM.DD)
        startDateStr = startDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
        endDateStr = endDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');

        // 변환된 값 input 노출
        $("#startDate").val(startDateStr);
        $("#endDate").val(endDateStr);
        $('.selectDateBox').removeClass('on'); //직접 선택인 경우에만 on 추가
    }

     // 캘린더 초기화
     $("#datepicker").datepicker("setDate", null);
}

//검색 버튼 클릭
const searchWithFilters  = () => {
    // API 호출
    openDartApi();
}

 // 검색 버튼이 클릭되었을 때에만 searchByPeriod 함수를 호출
 // custom 제외 옵션 선택 후 캘린더 변경 시 검색 버튼 누르면 강제적으로 설정되어 있는 날짜로 변경되면서 검색됨
document.getElementById("searchButton").addEventListener("click", () => {
    searchByPeriod();
});

// 초기 데이터를 가져오기 위해 처음에 한번 호출
searchByPeriod();

let headerSecLang; // headerSecLang 전역 변수로 선언
// 데이터 표시 테이블 업데이트 함수 > innderHTML 사용하게 되면 보안에 취약해서 사용 지양.
const displayTable = (data, totalCount) => {
    const table = document.createElement("table");
    const headerRow = table.insertRow(0);

    headerSecLang = document.querySelector('.hd_select_lang').textContent;

    // 각 언어에 따른 헤더 텍스트 정의
    let headers;
    if (headerSecLang.indexOf('KOR') != -1) {
        headers = ['번호', '제목', '제출인', '등록일', '비고'];
    } else if (headerSecLang.indexOf('ENG') != -1) {
        headers = ['Number', 'Title', 'Submitter', 'Date', 'Remarks'];
    } else if (headerSecLang.indexOf('CHN') != -1) {
        headers = ['编号', '标题', '提交者', '日期', '备注'];
    } else if (headerSecLang.indexOf('JPN') != -1) {
        headers = ['番号', 'タイトル', '提出者', '日付', '備考'];
    } else if (headerSecLang.indexOf('VTN') != -1) {
        headers = ['Số thứ tự', 'Tiêu đề', 'Người gửi', 'Ngày', 'Ghi chú'];
    } else if (headerSecLang.indexOf('RUS') != -1) {
        headers = ['Номер', 'Заголовок', 'Податель', 'Дата регистрации', 'Примечания'];
    } else if (headerSecLang.indexOf('SPN') != -1) {
        headers = ['Número', 'Título', 'Remitente', 'Fecha', 'Observaciones'];
    } else {
        // 기본 언어 설정
        headers = ["번호", "제목", "제출인", "등록일", "비고"];
    }

    // 테이블 헤더 생성
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    // 데이터 표시
    if (data.length > 0){
        data.forEach((item, index) => {
            const row = table.insertRow(index + 1);
            const number = (currentPage - 1) * itemsPerPage + index + 1; // 전체 개수 기준으로 번호 계산
            const cells = [
                number,
                item.report_nm, // 보고서 제목
                item.flr_nm, // 제출인
                formatDateString(item.rcept_dt), // 날짜 형식 변경
                item.rm, // 비고
            ];
            
            // 행에 셀 추가
            cells.forEach((cellData, cellIndex) => {
                const cell = row.insertCell(cellIndex);
                cell.textContent = cellData;
                // "제목" 셀에 클릭 이벤트 리스너 추가
                if (cellIndex === 1) {
                    cell.style.cursor = "pointer";
                    cell.addEventListener("click", () => {
                        openDartLink(item.rcept_no);
                    });
                }
            });
        });
    } else {  // 검색 결과가 없을 때
        const noResultRow = table.insertRow(1);
        const noResultCell = noResultRow.insertCell(0);
        noResultCell.colSpan = headers.length;

        // 각 언어에 따른 텍스트 정의
        if (headerSecLang.indexOf('KOR') != -1) {
            noResultCell.textContent = "검색 결과가 없습니다.";
        }else if (headerSecLang.indexOf('ENG') != -1) {
            noResultCell.textContent = "No results found.";
        } else if (headerSecLang.indexOf('CHN') != -1) {
            noResultCell.textContent = "没有找到结果。";
        } else if (headerSecLang.indexOf('JPN') != -1) {
            noResultCell.textContent = "検索結果はありません。";
        } else if (headerSecLang.indexOf('VTN') != -1) {
            noResultCell.textContent = "Không có kết quả nào.";
        } else if (headerSecLang.indexOf('RUS') != -1) {
            noResultCell.textContent = "Результаты поиска отсутствуют.";
        } else if (headerSecLang.indexOf('SPN') != -1) {
            noResultCell.textContent = "No se encontraron resultados.";
        } else {
            // 기본 언어 설정
            noResultCell.textContent = "검색 결과가 없습니다.";
        }
    }
    
    // 기존 테이블 삭제 및 새로운 테이블 추가
    const dataTable = document.getElementById("data-table");
    dataTable.innerHTML = "";
    dataTable.appendChild(table);
}

// 페이지네이션 함수 innerHTML 사용 X -> 문자열 파싱이 없어 효율적임
const displayPagination = (totalPages) => {
    const pagination = document.getElementById("pagination");
    pagination.classList.add("list_pagination");
    while (pagination.firstChild) {
        pagination.removeChild(pagination.firstChild);
    }

    const maxButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    // startPage 및 endPage 계산을 조정합니다.
    if (endPage - startPage + 1 < maxButtonsToShow) {
        startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    // 마지막 페이지가 표시된 버튼에 포함되도록 보장합니다.
    if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    // "<<" (첫 페이지) 버튼 추가
    const firstPageButton = document.createElement("li");
    firstPageButton.classList.add("page_prev", "page_btn");
    firstPageButton.addEventListener("click", () => {
        currentPage = 1;
        openDartApi(currentPage);
    });
    pagination.appendChild(firstPageButton);

    // "<" (이전 페이지) 버튼 추가
    const previousPageButton = document.createElement("li");
    previousPageButton.classList.add("page_first", "page_btn");
    previousPageButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            openDartApi(currentPage);
        }
    });
    pagination.appendChild(previousPageButton);

    // 페이지 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("li");
        pageButton.textContent = i;

        // 현재 페이지에 "on" 클래스 추가
        if (i === currentPage) {
            pageButton.classList.add("on");
        }

        pageButton.addEventListener("click", () => {
            currentPage = i;
            openDartApi(currentPage);
        });

        pagination.appendChild(pageButton);
    }

    // ">" (다음 페이지) 버튼 추가
    const nextPageButton = document.createElement("li");
    nextPageButton.classList.add("page_next", "page_btn");
    nextPageButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            openDartApi(currentPage);
        }
    });
    pagination.appendChild(nextPageButton);

    // ">>" (마지막 페이지) 버튼 추가
    const lastPageButton = document.createElement("li");
    lastPageButton.classList.add("page_last", "page_btn");
    lastPageButton.addEventListener("click", () => {
        currentPage = totalPages;
        openDartApi(currentPage);
    });
    pagination.appendChild(lastPageButton);
}

// Dart 링크를 열기 위한 함수
const openDartLink = (rcpNo) => {
    const dartLink = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcpNo}`;
    window.open(dartLink, "_blank");
}

// 등록일 날짜 형식 변경 함수
const formatDateString = (dateString) => {
    // "yyyymmdd" 형식의 날짜를 "yyyy.mm.dd" 형식으로 변경
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}.${month}.${day}`;
}

// 페이지 로드 시 OpenDart API 호출
document.addEventListener("DOMContentLoaded", function()  {
    // 초기에 6개월을 선택으로 설정
     const periodSelect = document.getElementById("period");
     periodSelect.value = "6";

     // 초기 데이터를 가져오기 위해 openDartApi 호출
     searchByPeriod();
     openDartApi();
 });


 // 나이스 셀렉트 커스텀 > 순서에 맞는 option 클릭되게(둥글게 열리는 디자인)
 // 이 코드는 common.js 에도 있으나 커스텀 이슈로 따로 빼서 사용 중
 $('.nice-select').each(function() {
    var select = $(this),
        name = select.attr('name');

    select.hide();

    select.wrap('<div class="nice-select-wrap"></div>');

    var parent = select.parent('.nice-select-wrap');

    parent.append('<ul id=' + name + ' class="inner_ul" style="display:none"></ul>');

    select.find('option').each(function() {
        var option = $(this),
            value = option.attr('value'),
            label = option.text();
            // 현재 select 엘리먼트에서 선택된 옵션의 텍스트 가져옴
            dropTxt = select.find('option:selected').text();

        if (option.is(":first-child")) {
            $('<a href="#" class="drop">' + dropTxt + '</a>').insertBefore(parent.find('ul'));
            parent.find('ul').append('<li><a href="#" id="' + value + '">' + label + '</a></li>');
        } else {
            parent.find('ul').append('<li><a href="#" id="' + value + '">' + label + '</a></li>');
        }

        parent.find('ul li').on('click', function(e) {
            const selectedIndex = $(this).index();
            const originalSelect = select;
            originalSelect[0].selectedIndex = selectedIndex;
            searchByPeriod();
        });
    });

    parent.find('a').on('click', function(e) {
        parent.toggleClass('down').find('ul').slideToggle(300);
        e.preventDefault();
    });

    parent.find('ul a').on('click', function(e) {
        var niceOption = $(this),
            value = niceOption.attr('id'),
            text = niceOption.text();
        select.val(value);
        parent.find('.drop').text(text);
        e.preventDefault();
    });
});

// 셀렉트 박스 동작 > 한개씩 열리게 / 다른 영역 누르면 닫히게
const selectWrap = document.querySelectorAll('.nice-select-wrap');

document.addEventListener('click', function(e) {
  // 외부 클릭 시 닫힘
  if (!e.target.closest('.nice-select-wrap')) {
    selectWrap.forEach(function(button) {
      button.classList.remove('down');

      const ul = button.querySelector('.inner_ul');
      if (ul) {
        ul.style.display = 'none';
      }
    });
  }
});

selectWrap.forEach(function(button, index) {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        // 다른 셀렉트 박스가 열려있으면 닫기
        selectWrap.forEach(function(button2, index2) {
            if (index !== index2 && button2.classList.contains('down')) {
                button2.classList.remove('down');
                
                const ul = button2.querySelector('.inner_ul');
                if (ul) {
                ul.style.display = 'none';
                }
            }
        });

        this.classList.toggle('down', this.classList.contains('down'));

        const ul = this.querySelector('.inner_ul');
        
        if (ul) {
            ul.style.display = this.classList.contains('down') ? 'block' : 'none';
        }
    });
});
