import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';
import { MatAutocompleteTrigger } from '@angular/material';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { WebcamImage, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import swal from 'sweetalert';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { APIURLS } from '../shared/api-url';
import { AppService } from '../shared/app.service';
import { HttpService } from '../shared/http-service';
import { Visitor } from '../visitorappointment/visitor.model';
import { IfStmt } from '@angular/compiler';
import { forEach } from '@angular/router/src/utils/collection';
import * as moment from 'moment';
import { AdditionalVisitor } from './additionvisitor.model';
import { User } from '../masters/user/user.model';
// import { FileSaver }  from 'angular-file-saver';
// import { saveAs } from 'file-saver';
declare var $: any;
declare var jQuery: any;

interface Belongings {
  id: number;
  name: string;
  checked: boolean;
}

@Component({
  selector: 'app-VMSApproval',
  templateUrl: './VMSApproval.component.html',
  styleUrls: ['./VMSApproval.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VMSApprovalComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild(NgForm) userForm: NgForm;
  @ViewChild(NgForm) calendarForm: NgForm;
  // myForm = new FormGroup({}) // Instantiating our form

  belongings: Belongings[];


  visitorTypeList: any[];
  purposeList: any[] = [];
  // searchTerm = new FormControl();
  numberOfPersonsEnt = new FormControl('', [Validators.required, Validators.pattern('[0-9]+'), Validators.min(1)]);
  options: string[] = ['One', 'Two', 'Three'];
  public employeeList: any[] = [[]];
  public webcamImage: WebcamImage = null;
  showTable: boolean = false;
  // printItem: any[]=[];
  // printItem: Visitor = new Visitor(0, '', '', '', '', '', '', '', '', true, '', '', '', '', true, true, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0, '', '', '');
  printItem: Visitor = {
    id: 0,
    isCancelled: true,
    isApproved: true,
    isPreShedualled: true,
    numberOfPerson: 0,
    modifiedBy: 0,
    isActive: true,
    fkVisitorType: 0,
    fkVisitorPurpose: 0
  } as Visitor;
  from_date: any;
  to_date: any;
  public tableWidget: any;
  addressId: number = 0;
  competencyList: any[];
  entityList: any[];
  designationList: any[];
  selParentRole: any = [];

  uid: number = 0;
  // calendarItem: Visitor = new Visitor(0, '', '', '', '', '', '', '', '', true, '', '', '', '', true, true, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0, '', '', '');
  calendarItem: Visitor = {
    id: 0,
    isCancelled: true,
    isApproved: true,
    isPreShedualled: true,
    numberOfPerson: 0,
    modifiedBy: 0,
    isActive: true,
    fkVisitorType: 0,
    fkVisitorPurpose: 0
  } as Visitor;
  checkinTime: any;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  errMsgPop1: string = "";
  isEdit: boolean = false;
  employeeId: string = "";
  formData: FormData = new FormData();
  file: File; successMsg: string = "";
  path: string = '';
  todayDate: Date = new Date();
  visitorName: string = '';
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  showWebcam: boolean = false;
  multipleWebcamsAvailable: boolean = false;
  seconds: number;
  finYear = (new Date()).getFullYear();
  value = "hello";
  selectedFiles: any = [];
  fileName: any;
  imageFile: string;
  empMList: any = [[]];
  visitorsList: any = [];
  typeOfVisitor: string = 'newvisit';
  visitorsList1: any = [];
  isSaved: boolean = false;
  id_sel: any;
  person: any[] = [[]];
  deletedPersonIds = [];
  disableClosedStatus: boolean = false;
  selectedBelongings: Belongings[] = [];
  d: Date = new Date();
  outTime = new Date;
  scannedCode: string;
  selectedVisitorType: any;
  selectedPurpose: any;
  othersFlag: boolean = false;
  dropdownSettings: {};
  popupWin: any;
  printContents: any;
  cal_id: any;
  additionalPersons: any[] = [];
  personIds: any = [];
  additionalVisitors: any[] = [[]];
  personToMeetType: number;
  recCount: any;
  loggedUser: number;
  locationId: any = 0;
  LocationMasterList: any[] = [[]];
  imageBlob: Blob;
  visitorId: any;
  visitorId1: any;
  base64: string;
  vid: any;
  imageFileContent: File;
  imageFlag: boolean = false;
  empMListCon: any = [];
  empMListCon1: any = [];
  show_Others: boolean = false;
  requireState: boolean = false;
  totaltodayvisits = 0;
  pendingbook = 0;
  pendingCheckouts = 0;
  currentUser: AuthData;

  length: number = 0;
  emailMsg1: string;
  // countryCodes:{'name':string,'code':string,'locode':string}[]=
  // [{'name':"Afghanistan", 'code':"93", 'locode':"AF / AFG" }, ["Albania", "355", "AL / ALB"], ["Algeria", "213", "DZ / DZA"], ["American Samoa", "1-684", "AS / ASM"], ["Andorra", "376", "AD / AND"], ["Angola", "244", "AO / AGO"], ["Anguilla", "1-264", "AI / AIA"], ["Antarctica", "672", "AQ / ATA"], ["Antigua and Barbuda", "1-268", "AG / ATG"], ["Argentina", "54", "AR / ARG"], ["Armenia", "374", "AM / ARM"], ["Aruba", "297", "AW / ABW"], ["Australia", "61", "AU / AUS"], ["Austria", "43", "AT / AUT"], ["Azerbaijan", "994", "AZ / AZE"], ["Bahamas", "1-242", "BS / BHS"], ["Bahrain", "973", "BH / BHR"], ["Bangladesh", "880", "BD / BGD"], ["Barbados", "1-246", "BB / BRB"], ["Belarus", "375", "BY / BLR"], ["Belgium", "32", "BE / BEL"], ["Belize", "501", "BZ / BLZ"], ["Benin", "229", "BJ / BEN"], ["Bermuda", "1-441", "BM / BMU"], ["Bhutan", "975", "BT / BTN"], ["Bolivia", "591", "BO / BOL"], ["Bosnia and Herzegovina", "387", "BA / BIH"], ["Botswana", "267", "BW / BWA"], ["Brazil", "55", "BR / BRA"], ["British Indian Ocean Territory", "246", "IO / IOT"], ["British Virgin Islands", "1-284", "VG / VGB"], ["Brunei", "673", "BN / BRN"], ["Bulgaria", "359", "BG / BGR"], ["Burkina Faso", "226", "BF / BFA"], ["Burundi", "257", "BI / BDI"], ["Cambodia", "855", "KH / KHM"], ["Cameroon", "237", "CM / CMR"], ["Canada", "1", "CA / CAN"], ["Cape Verde", "238", "CV / CPV"], ["Cayman Islands", "1-345", "KY / CYM"], ["Central African Republic", "236", "CF / CAF"], ["Chad", "235", "TD / TCD"], ["Chile", "56", "CL / CHL"], ["China", "86", "CN / CHN"], ["Christmas Island", "61", "CX / CXR"], ["Cocos Islands", "61", "CC / CCK"], ["Colombia", "57", "CO / COL"], ["Comoros", "269", "KM / COM"], ["Cook Islands", "682", "CK / COK"], ["Costa Rica", "506", "CR / CRI"], ["Croatia", "385", "HR / HRV"], ["Cuba", "53", "CU / CUB"], ["Curacao", "599", "CW / CUW"], ["Cyprus", "357", "CY / CYP"], ["Czech Republic", "420", "CZ / CZE"], ["Democratic Republic of the Congo", "243", "CD / COD"], ["Denmark", "45", "DK / DNK"], ["Djibouti", "253", "DJ / DJI"], ["Dominica", "1-767", "DM / DMA"], ["Dominican Republic", "1-809", " 1-829", " 1-849", "DO / DOM"], ["East Timor", "670", "TL / TLS"], ["Ecuador", "593", "EC / ECU"], ["Egypt", "20", "EG / EGY"], ["El Salvador", "503", "SV / SLV"], ["Equatorial Guinea", "240", "GQ / GNQ"], ["Eritrea", "291", "ER / ERI"], ["Estonia", "372", "EE / EST"], ["Ethiopia", "251", "ET / ETH"], ["Falkland Islands", "500", "FK / FLK"], ["Faroe Islands", "298", "FO / FRO"], ["Fiji", "679", "FJ / FJI"], ["Finland", "358", "FI / FIN"], ["France", "33", "FR / FRA"], ["French Polynesia", "689", "PF / PYF"], ["Gabon", "241", "GA / GAB"], ["Gambia", "220", "GM / GMB"], ["Georgia", "995", "GE / GEO"], ["Germany", "49", "DE / DEU"], ["Ghana", "233", "GH / GHA"], ["Gibraltar", "350", "GI / GIB"], ["Greece", "30", "GR / GRC"], ["Greenland", "299", "GL / GRL"], ["Grenada", "1-473", "GD / GRD"], ["Guam", "1-671", "GU / GUM"], ["Guatemala", "502", "GT / GTM"], ["Guernsey", "44-1481", "GG / GGY"], ["Guinea", "224", "GN / GIN"], ["Guinea-Bissau", "245", "GW / GNB"], ["Guyana", "592", "GY / GUY"], ["Haiti", "509", "HT / HTI"], ["Honduras", "504", "HN / HND"], ["Hong Kong", "852", "HK / HKG"], ["Hungary", "36", "HU / HUN"], ["Iceland", "354", "IS / ISL"], ["India", "91", "IN / IND"], ["Indonesia", "62", "ID / IDN"], ["Iran", "98", "IR / IRN"], ["Iraq", "964", "IQ / IRQ"], ["Ireland", "353", "IE / IRL"], ["Isle of Man", "44-1624", "IM / IMN"], ["Israel", "972", "IL / ISR"], ["Italy", "39", "IT / ITA"], ["Ivory Coast", "225", "CI / CIV"], ["Jamaica", "1-876", "JM / JAM"], ["Japan", "81", "JP / JPN"], ["Jersey", "44-1534", "JE / JEY"], ["Jordan", "962", "JO / JOR"], ["Kazakhstan", "7", "KZ / KAZ"], ["Kenya", "254", "KE / KEN"], ["Kiribati", "686", "KI / KIR"], ["Kosovo", "383", "XK / XKX"], ["Kuwait", "965", "KW / KWT"], ["Kyrgyzstan", "996", "KG / KGZ"], ["Laos", "856", "LA / LAO"], ["Latvia", "371", "LV / LVA"], ["Lebanon", "961", "LB / LBN"], ["Lesotho", "266", "LS / LSO"], ["Liberia", "231", "LR / LBR"], ["Libya", "218", "LY / LBY"], ["Liechtenstein", "423", "LI / LIE"], ["Lithuania", "370", "LT / LTU"], ["Luxembourg", "352", "LU / LUX"], ["Macau", "853", "MO / MAC"], ["Macedonia", "389", "MK / MKD"], ["Madagascar", "261", "MG / MDG"], ["Malawi", "265", "MW / MWI"], ["Malaysia", "60", "MY / MYS"], ["Maldives", "960", "MV / MDV"], ["Mali", "223", "ML / MLI"], ["Malta", "356", "MT / MLT"], ["Marshall Islands", "692", "MH / MHL"], ["Mauritania", "222", "MR / MRT"], ["Mauritius", "230", "MU / MUS"], ["Mayotte", "262", "YT / MYT"], ["Mexico", "52", "MX / MEX"], ["Micronesia", "691", "FM / FSM"], ["Moldova", "373", "MD / MDA"], ["Monaco", "377", "MC / MCO"], ["Mongolia", "976", "MN / MNG"], ["Montenegro", "382", "ME / MNE"], ["Montserrat", "1-664", "MS / MSR"], ["Morocco", "212", "MA / MAR"], ["Mozambique", "258", "MZ / MOZ"], ["Myanmar", "95", "MM / MMR"], ["Namibia", "264", "NA / NAM"], ["Nauru", "674", "NR / NRU"], ["Nepal", "977", "NP / NPL"], ["Netherlands", "31", "NL / NLD"], ["Netherlands Antilles", "599", "AN / ANT"], ["New Caledonia", "687", "NC / NCL"], ["New Zealand", "64", "NZ / NZL"], ["Nicaragua", "505", "NI / NIC"], ["Niger", "227", "NE / NER"], ["Nigeria", "234", "NG / NGA"], ["Niue", "683", "NU / NIU"], ["North Korea", "850", "KP / PRK"], ["Northern Mariana Islands", "1-670", "MP / MNP"], ["Norway", "47", "NO / NOR"], ["Oman", "968", "OM / OMN"], ["Pakistan", "92", "PK / PAK"], ["Palau", "680", "PW / PLW"], ["Palestine", "970", "PS / PSE"], ["Panama", "507", "PA / PAN"], ["Papua New Guinea", "675", "PG / PNG"], ["Paraguay", "595", "PY / PRY"], ["Peru", "51", "PE / PER"], ["Philippines", "63", "PH / PHL"], ["Pitcairn", "64", "PN / PCN"], ["Poland", "48", "PL / POL"], ["Portugal", "351", "PT / PRT"], ["Puerto Rico", "1-787", " 1-939", "PR / PRI"], ["Qatar", "974", "QA / QAT"], ["Republic of the Congo", "242", "CG / COG"], ["Reunion", "262", "RE / REU"], ["Romania", "40", "RO / ROU"], ["Russia", "7", "RU / RUS"], ["Rwanda", "250", "RW / RWA"], ["Saint Barthelemy", "590", "BL / BLM"], ["Saint Helena", "290", "SH / SHN"], ["Saint Kitts and Nevis", "1-869", "KN / KNA"], ["Saint Lucia", "1-758", "LC / LCA"], ["Saint Martin", "590", "MF / MAF"], ["Saint Pierre and Miquelon", "508", "PM / SPM"], ["Saint Vincent and the Grenadines", "1-784", "VC / VCT"], ["Samoa", "685", "WS / WSM"], ["San Marino", "378", "SM / SMR"], ["Sao Tome and Principe", "239", "ST / STP"], ["Saudi Arabia", "966", "SA / SAU"], ["Senegal", "221", "SN / SEN"], ["Serbia", "381", "RS / SRB"], ["Seychelles", "248", "SC / SYC"], ["Sierra Leone", "232", "SL / SLE"], ["Singapore", "65", "SG / SGP"], ["Sint Maarten", "1-721", "SX / SXM"], ["Slovakia", "421", "SK / SVK"], ["Slovenia", "386", "SI / SVN"], ["Solomon Islands", "677", "SB / SLB"], ["Somalia", "252", "SO / SOM"], ["South Africa", "27", "ZA / ZAF"], ["South Korea", "82", "KR / KOR"], ["South Sudan", "211", "SS / SSD"], ["Spain", "34", "ES / ESP"], ["Sri Lanka", "94", "LK / LKA"], ["Sudan", "249", "SD / SDN"], ["Suriname", "597", "SR / SUR"], ["Svalbard and Jan Mayen", "47", "SJ / SJM"], ["Swaziland", "268", "SZ / SWZ"], ["Sweden", "46", "SE / SWE"], ["Switzerland", "41", "CH / CHE"], ["Syria", "963", "SY / SYR"], ["Taiwan", "886", "TW / TWN"], ["Tajikistan", "992", "TJ / TJK"], ["Tanzania", "255", "TZ / TZA"], ["Thailand", "66", "TH / THA"], ["Togo", "228", "TG / TGO"], ["Tokelau", "690", "TK / TKL"], ["Tonga", "676", "TO / TON"], ["Trinidad and Tobago", "1-868", "TT / TTO"], ["Tunisia", "216", "TN / TUN"], ["Turkey", "90", "TR / TUR"], ["Turkmenistan", "993", "TM / TKM"], ["Turks and Caicos Islands", "1-649", "TC / TCA"], ["Tuvalu", "688", "TV / TUV"], ["U.S. Virgin Islands", "1-340", "VI / VIR"], ["Uganda", "256", "UG / UGA"], ["Ukraine", "380", "UA / UKR"], ["United Arab Emirates", "971", "AE / ARE"], ["United Kingdom", "44", "GB / GBR"], ["United States", "1", "US / USA"], ["Uruguay", "598", "UY / URY"], ["Uzbekistan", "998", "UZ / UZB"], ["Vanuatu", "678", "VU / VUT"], ["Vatican", "379", "VA / VAT"], ["Venezuela", "58", "VE / VEN"], ["Vietnam", "84", "VN / VNM"], ["Wallis and Futuna", "681", "WF / WLF"], ["Western Sahara", "212", "EH / ESH"], ["Yemen", "967", "YE / YEM"], ["Zambia", "260", "ZM / ZMB"], ["Zimbabwe", "263", "ZW / ZWE"] ];
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }
  //   ,private fb: FormBuilder){
  //   this.myForm = fb.group({
  //     'numberOfPerson': ['', [Validators.min(1)]]
  //   })
  // }

  private initDatatable(): void {
    // let exampleId: any = jQuery('#userTable');
    // this.tableWidget = exampleId.DataTable();
    var table = $('#userTable').DataTable(
      {
        "destroy": true,
        "columnDefs": [
          { "orderable": false, "targets": 11 }
        ]
      }
    );
    this.tableWidget = table;
  }
  public filteredItems = [];

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }


  getVisitorTypeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_TYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.visitorTypeList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.visitor_Type > b.visitor_Type) return 1;
          if (a.visitor_Type < b.visitor_Type) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.visitorTypeList = [];
    });
  }

  getPurposeList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_PURPOSE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.purposeList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.purpose > b.purpose) return 1;
          if (a.purpose < b.purpose) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.isLoading = false;
      this.purposeList = [];
    });
  }

  getPurpose(id) {
    let temp = this.purposeList.find(s => s.id == id);
    return temp ? temp.purpose : '';
  }
  getBelongingsList() {
    this.httpService.get(APIURLS.BR_MASTER_VISITOR_BELONGINGS_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.belongings = data.filter(x => x.checked).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    }).catch(error => {
      this.belongings = [];
      this.isLoading = false;
    });


    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }
  ngOnInit() {
    let Url = this.router.url;
    this.path = '/' + Url.split('/')[1];
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      this.currentUser = authData;
      this.loggedUser = authData.uid;
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.typeOfVisitor = params.get('type');
      });
      // this.typeOfVisitor = localStorage.getItem("categoryVMS");
      this.typeOfVisitor = (this.typeOfVisitor == undefined || this.typeOfVisitor == null) ? 'load' : this.typeOfVisitor;
      // console.log('visitorentry:'+this.typeOfVisitor);
      // this.getEvents();
      this.personToMeetType = 1;
      this.calendarItem.createdBy = this.currentUser.fkEmpId;
      this.printItem.createdBy = this.currentUser.fkEmpId;

      this.getVisitorTypeList();
      this.getLocationMasterList();
      // this.getAdditionaVisitorsDetails();
      this.getPurposeList();
      this.getBelongingsList();
      this.getDesignationList();
      this.getEmpList();
      this.getAppointments();
      this.initialPerson();

      let today = new Date();
      let thisMonth = today.getMonth();
      let numberOfDays = (thisMonth == 0 || thisMonth == 2 || thisMonth == 4 || thisMonth == 6 || thisMonth == 7 || thisMonth == 9 ||
          thisMonth == 11) ? 31 : 30;

      this.from_date = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
      this.to_date = new Date(today.getFullYear(), today.getMonth(), numberOfDays, 23, 59, 59);

      WebcamUtil.getAvailableVideoInputs()
        .then((mediaDevices: MediaDeviceInfo[]) => {
          this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
        });
      
      this.getVisitorsList();
  }
  addDays(date, daysToAdd) {
    var _24HoursInMilliseconds = 86400000;
    return new Date(date.getTime() + daysToAdd * _24HoursInMilliseconds);
  };
  todaysvisitorsList: any = [];
  todayCheckouts = 0;
  getAppointments() {
    //last 1 months
    this.todaysvisitorsList = [];
    var now = new Date();
    var threemonthAgo = this.addDays(now, - 30 * 1);
    let td = new Date();
    let StartMnDate, EndMnDate;
    let formatedFROMdate: string;
    let formatedTOdate: string;
    StartMnDate = this.getFormatedDate(threemonthAgo);
    let formatedtodaydate: string = this.getFormatedDate(td);
    formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
      ("00" + td.getDate()).slice(-2);
    EndMnDate = formatedTOdate;
    let searchStr = this.currentUser.baselocation + ',,,,,' + StartMnDate + "," + EndMnDate + ',' + ',' + ",";
    this.isLoading = true;
    this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
      if (data) {
        let visitors = data;
        if (visitors.length > 0) {
          for (let e of visitors) {
            var d = new Date(e.date);
            let formateddate: string = this.getFormatedDate(d);
            if (formateddate == formatedtodaydate) {
              this.todaysvisitorsList.push(e);
            }
          }
        }
        this.totaltodayvisits = this.todaysvisitorsList.filter(e => e.fromTime != null).length;
        this.pendingbook = this.todaysvisitorsList.filter(e => e.isPreShedualled == true && e.isCancelled == false).length;
        this.pendingCheckouts = visitors.filter(e => e.fromTime != null && e.toTime == null && e.isActive == true).length;
        this.todayCheckouts = this.todaysvisitorsList.filter(e => e.toTime != null).length;
        this.isLoading = false;
      }
    }).catch(error => {
      this.isLoading = false;
    });
  }
  bookAppointment(ch) {
    this.isLoading = true;
    this.typeOfVisitor = ch;
    let td = new Date();
    if (this.typeOfVisitor == 'newvisit' || this.typeOfVisitor == 'bookvisit' || this.typeOfVisitor == 'checkout') {
      this.from_date = this.getFormatedDate(td);
      this.to_date = this.getFormatedDate(td);
    }
    else if (this.typeOfVisitor == 'previsit' || this.typeOfVisitor == 'revisit') {
      var now = new Date();
      var threemonthAgo = this.addDays(now, - 30 * 1);
      this.from_date = this.getFormatedDate(threemonthAgo);//new Date(td.getFullYear(), td.getMonth(), 1);
      this.to_date = this.getFormatedDate(td);
    }
    this.getVisitorsList();
    this.isLoading = false;
  }
  // clearForm(){
  // console.log('form reset');
  //   this.userForm.resetForm();
  //   this.getVisitorsList();
  // }

  getLocationMasterList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.LocationMasterList = data;
        // console.log(this.LocationMasterList);
        let code = this.LocationMasterList.find(x => x.id == this.currentUser.baselocation).code;
        this.getApproversDetails(code);
      }
      //this.reInitDatatable(); Commented By shyam bOra
    }).catch(error => {
      this.isLoading = false;
      this.LocationMasterList = [];
    });
  }

  getLocation(id) {
    let lo = this.LocationMasterList.find(s => s.id == id);
    return lo ? lo.code + '-' + lo.name : '';
  }

  getAdditionaVisitorsDetails() {
    this.httpService.get(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_ALL_API).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.additionalVisitors = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.additionalVisitors = [];
    });
  }

  getDesignationList() {
    this.errMsg = "";
    // this.isLoading = true;
    this.httpService.get(APIURLS.BR_DESIGNATION_API).then((data: any) => {
      if (data.length > 0) {
        this.designationList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.designationList = [];
    });
  }
  ngOnDestroy() {
    localStorage.removeItem("categoryVMS");
  }

  dropdownSettings1 = {};

  initialPerson() {
    var line_no = this.person.length;
    for (let i = 0; i < 2; i++) {
      line_no = this.person.length;
      let genId: any = (line_no > 0) ? this.person[this.person.length - 1].id : 0;
      let nextKraId = genId + 1;
      var nextY = { 'id': genId, 'name': '', 'temp1': '', 'phone': '', 'email': '' };
      this.person.push(nextY);
    }
  }

  addPersonDetails() {
    this.showTable = true;
    var line_no = this.person.length;
    // this.recCount = line_no;
    // console.log('line_no:'+this.recCount);
    let genId: any = (line_no) ? this.person[this.person.length - 1].id : 0;
    let nextKraId = genId + 1;
    var person_temp = { 'id': nextKraId, 'name': '', 'temp1': '', 'phone': '', 'email': '' };
    // var person_temp ={};
    this.person.push(person_temp);
    this.recCount = this.person.length;
    // console.log('New row added successfully', 'New Row');
    // console.log(this.person);
    return true;
  }

  getApproversDetails(code) {
    this.httpService.getByParam(APIURLS.BR_GET_VMS_APPROVERS, code + ", ," + this.currentUser.employeeId).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.Approverslist = data;
      }
    }).catch(error => {
      this.isLoading = false;
      this.Approverslist = [];
    });
  }

  removePersonDetails(id: number, position: number) {
    // console.log(id);
    if (this.person.length == 0)
      this.showTable = false;
    if (id != 0 && this.personIds.find(s => s == id)) this.deletedPersonIds.push(id);
    this.person.splice(position, 1);
    this.recCount--;
    // console.log(this.person.length);
    // this.getTotalWeightageNextYr();
  }

  getFormatedDate(d) {
    let fd = new Date(d);
    let formateddate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
      ("00" + fd.getDate()).slice(-2);
    // return new Date(fd.getFullYear(),fd.getMonth(),fd.getDate());
    return formateddate;
  }
  getNewFormatedDate(d) {
    let fd = new Date(d);
    let formateddate = ("00" + (fd.getMonth() + 1)).slice(-2) + "/" +
      ("00" + fd.getDate()).slice(-2) + "/" + fd.getFullYear();
    // return new Date(fd.getFullYear(),fd.getMonth(),fd.getDate());
    return formateddate;
  }
  getTimeFormat(time) {
    return moment('1970-01-01 ' + time);
  }

  isVisitorListLoading: boolean = false;
  getVisitorsList() {
    this.isVisitorListLoading = true;

    this.visitorsList1 = [];
    let td = new Date();

   
    if (this.typeOfVisitor == 'newvisit' || this.typeOfVisitor == 'bookvisit' || this.typeOfVisitor == 'checkout' || this.typeOfVisitor == 'load') {
      if (this.from_date == null || this.from_date == undefined) {
        this.from_date = this.getFormatedDate(td);
      }
      else {
        this.from_date = this.getFormatedDate(this.from_date);
      }
      if (this.to_date == null || this.to_date == undefined) {
        this.to_date = this.getFormatedDate(td);
      }
      else {
        this.to_date = this.getFormatedDate(this.to_date);
      }

    }
    let model:any={};
    model.fromdate=this.getFormatedDate(this.from_date);
    model.todate=this.getFormatedDate(this.to_date);
    model.employeeId=this.currentUser.employeeId;
    let searchStr = this.locationId + ',,,,,' + this.getFormatedDate(this.from_date) + "," + this.getFormatedDate(this.to_date)
      + ',' + ',' + ",";
    this.httpService.post(APIURLS.GET_VISITOR_FOR_APPROVAL, model).then((data: any) => {
      if (data) {
        this.visitorsList1 = data.filter(x => x.temp13 == 'Pending For Approval.');
        this.visitorsList = [];

        this.visitorsList = this.visitorsList1;
        this.visitorsList.reverse();

        this.isVisitorListLoading = false;
      }
      this.reInitDatatable();
    }).catch(error => {
      this.isLoading = false;
      this.visitorsList = [];
      this.visitorsList1 = [];

      this.isVisitorListLoading = false;
    });
  }

  isNullOrUndefined<T>(obj?: T | null | ''): boolean {
    return obj == null;
  }

  keyPressNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 32 && (charCode < 48 || charCode > 57)) {

      return false;
    }
    return true;
    // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;

  }
  // enforceMinMax(el){
  //   if(el.value != ""){
  //     if(parseInt(el.value) < parseInt(el.min)){
  //       el.value = el.min;
  // console.log('value less than min');
  //       this.userForm.controls.numberOfPersonsEnt.invalid = true;
  //       return false;
  //     }
  //    return true;
  //   }
  // }

  isEmpty(str) {
    if (str.length == 0) return true;
    else return false;
  }

  getEmpList() {
    // debugger;
    this.isLoading = true;
    this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_GETBY_ANY_API, this.currentUser.baselocation).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.empMList = data.filter(x => x.isActive);
        // console.log(this.empMList);
        this.employeeList = data;
        // console.log(this.employeeList);
        this.locationId = this.empMList.find(s => s.employeeId == this.currentUser.employeeId).baseLocation;
        // console.log(this.locationId);
        // var empMList = [[]];
        //this.empMList = this.empMList.filter(s => s.isActive && s.baseLocation == this.locationId);
        this.empMList.forEach(element => {
          var t = { 'id': 0, 'name': '' };
          t.id = element.id;
          let middleName = this.isEmpty(element.middleName.trim()) ? ' ' : ' ' + element.middleName + ' ';
          t.name = element.firstName + middleName + element.lastName + '-' + element.employeeId + ' (' + element.designation + ')';
          this.empMListCon = [...this.empMListCon, t];
        })
        // this.empListCon1 = this.empListCon;
        // console.log(this.empListCon);
        // this.dropdownSettings1 = {
        //   singleSelection: true,
        //   idField: 'id',
        //   textField: 'name',
        //   allowSearchFilter: true
        // };
      }
      this.getVisitorsList();

    }).catch(error => {
      this.isLoading = false;
      this.empMList = [];
    });
  }

  onFocus() {
    this.autocompleteTrigger._onChange('');
    this.autocompleteTrigger.openPanel();
  }
  printSetup(user) {
    // debugger;
    this.printItem = user;
    jQuery("#aModal").modal('hide');
    jQuery("#sModal").modal('show');
    // this.print();
  }
  AdditionalVisitorsList: AdditionalVisitor[] = [];


  ngAfterViewInit() {
    this.initDatatable(); //Commented by Shyam
    $('#print-section').on('load', function () {
      this.printItem = [];

    });

    $("#camerapanelaction").click(function () {
      $("#camerapanel").slideToggle();
      var icon = $(this).find("i");
      icon.toggleClass("far fa-hand-point-up far fa-hand-point-down")

    });
  }



  closeSaveModal() {
    this.showWebcam = !this.showWebcam;
    this.getAppointments();
    this.getVisitorsList();
    jQuery("#saveModal").modal('hide');
    // if(this.isEdit)
    // {
    //   this.printall(this.visitorId1);
    // }
    // else
    // {
    //   this.printall(this.visitorId);
    // }    
    //this.router.navigateByUrl('/welcome-page');
  }

  onImgFileChange(event: any) {
    this.errMsg = '';
    // debugger;
    this.formData = new FormData();
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      //let file: File = fileList[0];
      this.file = fileList[0];
      this.formData.append("File", this.file);
      // if (this.file.type.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') === -1) {
      //     this.errMsg = " Select xlsx File Type to Upload";
      // }
      // else {
      //let formData: FormData = new FormData();
      //     this.formData.append("File", this.file);
      // }
    }
    //window.location.reload();
  }


  onUpdateUser(isEdit: boolean, data) {

  }


  getDesignation(id) {
    // console.log(id);
    return this.designationList.find(s => s.id === id).name;
  }

  getStatus(mobile) {
    return this.visitorsList.some(s => s.mobile == mobile && s.isActive == true);
  }


  endDateTime = new Date();

  checkOut(user) {
    // debugger;
    this.calendarForm.form.markAsPristine();
    this.calendarForm.form.markAsUntouched();
    this.calendarForm.form.updateValueAndValidity();
    this.isLoadingPop = true;
    // this.calendarItem = new Visitor(0, '', 0, '', '', '', '', '', '', true, '', '', '', '', true, true, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','',0,0);
    this.scannedCode = '';
    this.calendarItem = user;
    this.checkinTime = this.getNewFormatedDate(this.calendarItem.date) + ',' + this.calendarItem.fromTime;

    this.endDateTime = new Date();
    this.d = new Date();
    this.scannedCode = (this.calendarItem.id + this.calendarItem.mobile);
    // console.log(this.calendarItem.id+''+this.calendarItem.mobile);
    this.isLoadingPop = false;
    jQuery("#checkoutModal").modal('show');
  }
  barCode: string;
  modalCheckout() {
    this.calendarForm.form.markAsPristine();
    this.calendarForm.form.markAsUntouched();
    this.calendarForm.form.updateValueAndValidity();
    this.isLoadingPop = true;
    let searchStr = this.locationId + ',,,,,,,,,';
    this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
      if (data) {
        let item = data.map((i) => { i.barcode = i.id + '' + i.mobile; return i; }).filter(s => s.fromTime != null && s.toTime == null && s.isActive == true && s.barcode == this.barCode);
        if (item.length > 0) {
          this.calendarItem = item[0];
          this.scannedCode = this.barCode;
          this.checkinTime = this.getNewFormatedDate(this.calendarItem.date) + ',' + this.calendarItem.fromTime;
          this.endDateTime = new Date();
          this.d = new Date();
          jQuery("#checkoutModal").modal('show');
        }
        else {
          swal({
            title: "Message",
            text: "Please enter valid Barcode",
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          }).then((willDelete) => {
            if (willDelete) {
              this.isLoading = false;
              this.isLoadingPop = false;
              this.barCode = '';
            }
          });
        }
      }
      this.isLoadingPop = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  completeVisit() {
    this.isLoadingPop = true;
    this.isLoading = true;
    let dt_temp = new Date(this.endDateTime);
    var formatedtoTime = ("00" + dt_temp.getHours()).slice(-2) + ":" +
      ("00" + dt_temp.getMinutes()).slice(-2) + ":" +
      ("00" + dt_temp.getSeconds()).slice(-2);

    var formattedDateString = dt_temp.getFullYear() + "-" + ("00" + (dt_temp.getMonth() + 1)).slice(-2) + "-" +
      ("00" + dt_temp.getDate()).slice(-2) + " " + formatedtoTime;

    var fromdate = new Date(this.calendarItem.date);
    var formattedFromDate = fromdate.getFullYear() + "-" + ("00" + (fromdate.getMonth() + 1)).slice(-2) + "-" +
      ("00" + fromdate.getDate()).slice(-2) + " " + this.calendarItem.fromTime;

    if (!this.calendarItem.isPreShedualled)
      this.calendarItem.endDateTime = formattedDateString;
    this.calendarItem.toTime = formatedtoTime;
    //  if(new Date(formattedDateString) > new Date(this.calendarItem.date)){
    if (new Date(formattedDateString) > new Date()) {
      swal({
        title: "Message",
        text: "Future date cannot be set",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
          this.isLoadingPop = false;
        }
      });
    }
    else if (new Date(formattedDateString) > new Date(formattedFromDate)) {
      if (this.scannedCode == this.calendarItem.id + '' + this.calendarItem.mobile) {
        this.calendarItem.isActive = false;
        // var d = new Date(this.outTime);
        // let toTime = ("00" + d.getHours()).slice(-2) + ":" +
        // ("00" + d.getMinutes()).slice(-2) + ":" +
        // ("00" + d.getSeconds()).slice(-2);
        // d=new Date(this.endDateTime);
        // let formateddate:string = this.d.getFullYear() + "-" +("00" + (this.d.getMonth() + 1)).slice(-2) + "-" +
        // ("00" + this.d.getDate()).slice(-2) + " " + toTime;

        // this.calendarItem.endDateTime = formateddate;
        // this.calendarItem.toTime = toTime;
        let connection: any;
        connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
        connection.then((data: any) => {
          // this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            // jQuery("#myModal").modal('hide');
            this.errMsgPop1 = 'Checkout complete';
            jQuery("#checkoutModal").modal('hide');
            this.isLoadingPop = false;
            this.isLoading = false;
            this.getAppointments();
            this.getVisitorsList();
            this.barCode = '';
            // this.router.navigateByUrl('welcome-page');
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.isLoading = false;
          this.errMsgPop = 'Error saving Appointment data..';
        });
      }
      else {
        swal({
          title: "Message",
          text: "Barcode mismatch",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        }).then((willDelete) => {
          if (willDelete) {
            this.isLoading = false;
            this.isLoadingPop = false;
          }
        });
      }
    } else {
      //if endtime is less than starttime
      swal({
        title: "Message",
        text: "Start date/time cannot exceed End Date/time",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
          this.isLoadingPop = false;
        }
      });
    }
  }
  checkValue(event) {
    // console.log('value'+event.target.value);
    if (event.target.value <= 0)
      return false;
    else
      return true;
  }
  typeChange(val) {
    if (val == "2") {
      this.selParentRole = null;
    }
    else if (val == "1") {
      this.calendarItem.temp4 = null;
      this.calendarItem.temp6 = null;
      this.calendarItem.temp5 = null;
    }
  }

  Approverslist: any[] = [];

  onSaveEntry() {
    // console.log(event);


    if (this.calendarItem.numberOfPerson > 1 && this.person.length < 1 || this.person.length != (this.calendarItem.numberOfPerson - 1)) {
      swal({
        title: "Message",
        text: "Please enter additional visitor details",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      })
    }
    if (this.Approverslist.length == 0) {
      swal({
        title: "Message",
        text: "Approvers not defined.",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      })
    }
    else {
      let connection: any;
      this.isLoading = true;
      this.isLoadingPop = true;
      let formateddate: string = this.d.getFullYear() + "-" + ("00" + (this.d.getMonth() + 1)).slice(-2) + "-" +
        ("00" + this.d.getDate()).slice(-2) + " " +
        ("00" + this.d.getHours()).slice(-2) + ":" +
        ("00" + this.d.getMinutes()).slice(-2) + ":" +
        ("00" + this.d.getSeconds()).slice(-2);

      let fromTime = ("00" + this.d.getHours()).slice(-2) + ":" +
        ("00" + this.d.getMinutes()).slice(-2) + ":" +
        ("00" + this.d.getSeconds()).slice(-2);

      let formatedenddate: string = this.d.getFullYear() + "-" + ("00" + (this.d.getMonth() + 1)).slice(-2) + "-" +
        ("00" + (this.d.getDate())).slice(-2) + " " +
        ("00" + (this.d.getHours())).slice(-2) + ":" +
        ("00" + (this.d.getMinutes())).slice(-2) + ":" +
        ("00" + this.d.getSeconds()).slice(-2);

      this.calendarItem.temp2 = this.selectedBelongings.map(x => x.name).join();
      this.calendarItem.fkVisitorType = this.selectedVisitorType.id;
      this.calendarItem.fkVisitorPurpose = this.selectedPurpose.id;
      if (this.personToMeetType == 1) {
        let tem = this.empMList.find(s => s.id == this.selParentRole);
        this.calendarItem.fkEmployeeId = tem.employeeId;
        this.calendarItem.temp8 = tem.baseLocation;

        this.calendarItem.fkEmployeeName = tem.firstName + ' ' + tem.lastName;
        this.calendarItem.employeeEmail = tem.email;
      }
      else {
        this.calendarItem.fkEmployeeId = '0';
        this.calendarItem.fkEmployeeName = '';
        this.calendarItem.employeeEmail = '';

      }
      if (!this.calendarItem.isPreShedualled) {
        this.calendarItem.date = formateddate;
        this.calendarItem.endDateTime = formatedenddate;
      }
      this.calendarItem.isPreShedualled = this.calendarItem.isPreShedualled ? this.calendarItem.isPreShedualled : false;
      this.calendarItem.fromTime = fromTime;
      this.calendarItem.toTime = '';
      //  this.calendarItem.fkEmployeeId = this.selParentRole.id;
      //  this.calendarItem.fkEmployeeName = this.selParentRole.firstName;
      //this.calendarItem.isActive = true;
      this.calendarItem.temp3 = this.personToMeetType.toString();
      this.calendarItem.temp7 = this.locationId;

      //Code added for VMS Approval
      this.calendarItem.temp14 = this.Approverslist[0].approverId;
      this.calendarItem.temp13 = 'Pending For Approval.';

      //End

      this.calendarItem.numberOfPerson = this.calendarItem.numberOfPerson <= 0 ? 1 : this.calendarItem.numberOfPerson;
      var checkAlready = false, otherCheckAlready = true;
      // if (this.personToMeetType == 1)
      //   checkAlready = this.visitorsList.find(s => s.mobile == this.calendarItem.mobile && s.id != this.calendarItem.id && s.isActive == true);
      // else
      //   checkAlready = false;
      if (!this.isEdit)
        checkAlready = this.todaysvisitorsList.find(s => s.mobile == this.calendarItem.mobile && s.isActive == true);

      if (!checkAlready) {
        if (this.isEdit) {
          // this.calendarItem.isActive = true;
          this.calendarItem.temp = this.imageFile ? this.imageFile : this.calendarItem.temp;

          connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
          this.visitorId1 = this.calendarItem;
          // this.errMsgPop1 = 'Appointment updated!';
        }
        else {
          this.calendarItem.temp = this.imageFile ? this.imageFile : '';
          this.calendarItem.id = 0;

          connection = this.httpService.post(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem);
          // this.errMsgPop1 = 'Appointment confirmed!';
        }
        connection.then((data: any) => {
          this.visitorId = data;
          // this.vid = this.visitorId.id;
          // console.log(this.visitorId);
          // this.isLoadingPop = false;
          // console.log(data);
          if (data == 200 || data.id > 0) {

            this.cal_id = data.id > 0 ? data.id : this.calendarItem.id;
            this.vid = data.id > 0 ? data.id : this.calendarItem.id;



            // console.log('update records:'+this.personIds);
            // console.log(this.person);
            for (let des of this.person) {
              if (des.name != '' || des.name != null) {
                var nextY = { 'id': 0, 'name': '', 'temp1': '', 'mobile': '', 'email': '', 'fkId': 0 };
                // console.log('->'+this.nextYr[i].closure_date);
                nextY.fkId = this.cal_id;
                nextY.name = des.name;
                nextY.temp1 = des.temp1;
                // nextY.id = des.id;
                nextY.mobile = des.phone;
                nextY.email = des.email;
                let createupdateflag = this.personIds.some(s => s == des.id);
                if (createupdateflag) {
                  nextY.id = des.id;
                  connection = this.httpService.put(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_POST_API, this.cal_id, nextY);
                }
                else
                  connection = this.httpService.post(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_POST_API, nextY);
              }

              if (this.deletedPersonIds.length > 0) {
                this.deletedPersonIds.forEach(element => {
                  let findOldIdNext = this.deletedPersonIds.some(s => s == element);
                  if (findOldIdNext)
                    connection = this.httpService.delete(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_POST_API, element);
                });
              }
            }
            jQuery("#myModal").modal('hide');
            var tempText = '';
            tempText = (this.calendarItem.temp == '') ? 'But you will not be able to print pass as you missed clicking visitors picture' : '';
            // console.log(this.calendarItem.temp);
            this.errMsgPop1 = 'Visitor Entry Saved!' + tempText;

            this.isSaved = true;
            this.isLoading = false;
            this.isLoadingPop = false;
            jQuery("#saveModal").modal('show');
            // this.getVisitorsList();
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error saving Visitor Entry...';
        });
      }
      else {
        swal({
          title: "Message",
          text: "The mobile number entered is already been given appointment by employee (or) already checked in.",
          icon: "warning",
          dangerMode: false,
          buttons: [false, true]
        }).then((willDelete) => {
          if (willDelete) {
            this.isLoading = false;
            this.isLoadingPop = false;
          }
        });
      }
    }

  }
  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
  }
  closemodal(): void {
    this.showWebcam = !this.showWebcam;
  }

  closeEntry(value: Visitor) {
    swal({
      title: "Message",
      text: "Are you sure to close ?",
      icon: "warning",
      dangerMode: false,
      buttons: [true, true]
    }).then((willDelete) => {
      if (willDelete) {
        this.close(value);
      }
    })
  }
  close(value: Visitor) {
    this.calendarItem = Object.assign({}, value);
    this.calendarItem.isActive = false;
    let connection: any;
    connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
    connection.then((data: any) => {
      // this.isLoadingPop = false;
      if (data == 200 || data.id > 0) {
        // jQuery("#myModal").modal('hide');
        this.errMsgPop1 = 'Entry Closed Successfully.';
        this.isLoadingPop = false;
        this.isLoading = false;
        this.getAppointments();
        this.getVisitorsList();
        this.barCode = '';
        // this.router.navigateByUrl('welcome-page');
      }
    }).catch(error => {
      this.isLoadingPop = false;
      this.isLoading = false;
      this.errMsgPop = 'Error closing entry..';
    });
  }

  isMasterSel: boolean = false;
  isLoadingReq: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.visitorsList.length; i++) {
      this.visitorsList[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.visitorsList.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.visitorsList.length; i++) {
      if (this.visitorsList[i].isSelected)
        this.checkedlist.push(this.visitorsList[i]);
    }
    this.checkedRequestList = this.checkedlist;
  }


  OnApprove() {
    this.checkedRequestList.forEach((element, index) => {
      this.calendarItem = Object.assign({}, element);
      //this.calendarItem.isActive=false;
      
      this.calendarItem.temp13 = 'Approved';
      this.calendarItem.temp14 = this.currentUser.employeeId;

      let connection: any;
      connection = this.httpService.put(APIURLS.BR_APPROVE_VISITOR, this.calendarItem.id, this.calendarItem);
      connection.then((data: any) => {
        // this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          // jQuery("#myModal").modal('hide');
          // this.errMsgPop1 = 'Entry Closed Successfully.';
          this.isLoadingPop = false;
          this.isLoading = false;
          //this.getAppointments();
          this.updateHistory();
          this.barCode = '';
          // this.router.navigateByUrl('welcome-page');
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.isLoading = false;
        this.errMsgPop = 'Error closing entry..';
      }).then((value) => {
        this.getVisitorsList();
        this.errMsgPop1 = 'Entry Closed Successfully.';
      });
    });
    this.checkUncheckAll();
    swal("Approved Successfully..!");
  }

  OnReject() {
    this.checkedRequestList.forEach(element => {
      this.calendarItem = Object.assign({}, element);
      //this.calendarItem.isActive=false;
      this.calendarItem.temp13 = 'Rejected';
      this.calendarItem.temp14 = this.currentUser.employeeId;
      let connection: any;
      connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
      connection.then((data: any) => {
        // this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          // jQuery("#myModal").modal('hide');
          // this.errMsgPop1 = 'Entry Closed Successfully.';
          this.isLoadingPop = false;
          this.isLoading = false;
          //this.getAppointments();
          this.updateRejectedHistory();
          this.barCode = '';
          // this.router.navigateByUrl('welcome-page');
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.isLoading = false;
        this.errMsgPop = 'Error closing entry..';
      }).then((value) => {
        this.getVisitorsList();
        this.errMsgPop1 = 'Entry Closed Successfully.';

      });
    })
    this.checkUncheckAll();
    swal("Rejected Successfully..!");

  }
  updateRejectedHistory() {
    this.checkedRequestList.forEach(element => {
      let model: any = {};
      model.requestNo = element.id;
      model.requestStatus = "Rejected";
      model.comments = "Rejected";
      model.actualApprover = this.currentUser.employeeId;
      model.priority = this.Approverslist.find(x => x.approverId == this.currentUser.employeeId).sequence;
      model.requestType = "Visitor";
      let connection = this.httpService.put(APIURLS.BR_UPDATE_HISTORY, element.id, model);
    });
  }
  updateHistory() {
    this.checkedRequestList.forEach(element => {
      let model: any = {};
      model.requestNo = element.id;
      model.requestStatus = "Approved";
      model.comments = "Mass Approved";
      model.actualApprover = this.currentUser.employeeId;
      model.priority = this.Approverslist.find(x => x.approverId == this.currentUser.employeeId).sequence;
      model.requestType = "Visitor";
      let connection = this.httpService.put(APIURLS.BR_UPDATE_HISTORY, element.id, model);
    });
  }
}
