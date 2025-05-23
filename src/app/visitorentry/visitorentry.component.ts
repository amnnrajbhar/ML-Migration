import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
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
// import { forEach } from '@angular/router/src/utils/collection';
import * as moment from 'moment';
import { AdditionalVisitor } from './additionvisitor.model';
import { User } from '../masters/user/user.model';
// import { FileSaver }  from 'angular-file-saver';
// import { saveAs } from 'file-saver';
declare var $: any;
declare var toastr: any;
declare var jQuery: any;

interface Belongings {
  id: number;
  name: string;
  checked: boolean;
}

interface VisitorDetails {
  id: number;
  name: string;
  email: string;
  mobile: string;
  companyName: string;
  carrying: string;
  image: any;
  BelongingsList: any[];
  count: number;
}

@Component({
  selector: 'app-visitorentry',
  templateUrl: './visitorentry.component.html',
  styleUrls: ['./visitorentry.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VisitorentryComponent implements OnInit {
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
  } as Visitor;;
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
  selectedBelongings: any[] = [];
  selectedAddBelongings: any[] = [];
  selectedNonBelongings: any[] = [];
  selectedAddNonBelongings: any[] = [];
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
  otherplantmovement = 0;
  currentUser: AuthData;

  stringQrCode: any;

  length: number = 0;
  emailMsg1: string;

  VisitorDetails: VisitorDetails[] = [];

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
  CheckOthers(value) {
    if (value != null || value != undefined) {
      let temp = this.purposeList.find(s => s.id == value.id);
      return temp ? temp.purpose : '';
    }
  }
  getType(id) {
    if (id) {
      let temp = this.visitorTypeList.find(s => s.id == id);
      return temp ? temp.visitor_Type : '';
    }
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
    if (chkaccess == true) {
      // console.log(chkaccess);
      let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
      this.currentUser = authData;
      this.loggedUser = authData.uid;
      this.route.paramMap.subscribe((params: ParamMap) => {
        this.typeOfVisitor = params.get('type');
      });

      this.calendarItem.createdBy = this.currentUser.fkEmpId;
      this.printItem.createdBy = this.currentUser.fkEmpId;

      // this.typeOfVisitor = localStorage.getItem("categoryVMS");
      this.typeOfVisitor = (this.typeOfVisitor == undefined || this.typeOfVisitor == null) ? 'load' : this.typeOfVisitor;
      // console.log('visitorentry:'+this.typeOfVisitor);
      // this.getEvents();
      this.personToMeetType = 1;
      this.getVisitorTypeList();
      this.getLocationMasterList();
      // this.getAdditionaVisitorsDetails();
      this.getPurposeList();
      this.getBelongingsList();
      this.getDesignationList();
      this.getEmpList();
      this.getAppointments();
      this.initialPerson();
      this.getBaseLocation();
      WebcamUtil.getAvailableVideoInputs()
        .then((mediaDevices: MediaDeviceInfo[]) => {
          this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
    }
    else {
      // console.log('unauthorized');
      this.router.navigate(["/unauthorized"]);
    }
  }
  addDays(date, daysToAdd) {
    var _24HoursInMilliseconds = 86400000;
    return new Date(date.getTime() + daysToAdd * _24HoursInMilliseconds);
  };
  todaysvisitorsList: any = [];
  todaysvisitorsList1: any = [];
  todayCheckouts = 0;
  getAppointments() {
    //last 1 months
    this.todaysvisitorsList = [];
    this.todaysvisitorsList1 = [];
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
            if (formateddate == formatedtodaydate && e.temp13 == "Approved") {
              this.todaysvisitorsList.push(e);
            }
            if (formateddate == formatedtodaydate) {
              this.todaysvisitorsList1.push(e);
            }
          }
        }
        this.totaltodayvisits = this.todaysvisitorsList.filter(e => e.fromTime != null).length;
        // console.log(this.pendingbook);
        // console.log(this.todaysvisitorsList1);
        this.pendingbook = this.todaysvisitorsList1.filter(e => e.isPreShedualled == true && e.isCancelled == false).length;
        // console.log(this.pendingbook);
        this.pendingCheckouts = visitors.filter(e => e.fromTime != null && (e.toTime == null || e.isActive == true)).length;
        this.todayCheckouts = this.todaysvisitorsList.filter(e => e.toTime != null && e.isActive == false).length;
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
      var threemonthAgo = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), 1, 0, 0, 0);
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
        // this.getApproversDetails(code);
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
    var person_temp = { 'id': nextKraId, 'name': '', 'temp1': '', 'phone': '', 'email': '', 'temp2': '', 'temp3': '', 'selectedAddBelongings': [], 'selectedAddNonBelongings': [] };
    // var person_temp ={};
    this.person.push(person_temp);
    this.recCount = this.person.length;
    // console.log('New row added successfully', 'New Row');
    // console.log(this.person);
    return true;
  }

  getApproversDetails(code) {
    // console.log(code);
    // console.log(this.selParentRole);
    this.httpService.getByParam(APIURLS.BR_GET_VMS_APPROVERS, code+',Visitor' + "," + this.currentUser.employeeId).then((data: any) => {
      // this.isLoading = false;
      if (data.length > 0) {
        this.Approverslist = data;
      }
      else {
        this.Approverslist = [];
      }
    }).catch(error => {
      console.log(error);
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

  isGetVisitorsListLoading: boolean = false;
  getVisitorsList() {
    this.isGetVisitorsListLoading = true;

    this.visitorsList1 = [];
    let td = new Date();

    if (this.typeOfVisitor == 'newvisit' || this.typeOfVisitor == 'bookvisit' || this.typeOfVisitor == 'checkout' || this.typeOfVisitor == 'load') {
      this.from_date = this.getFormatedDate(td);
      this.to_date = this.getFormatedDate(td);
    }
    let searchStr = this.locationId + ',,,,,' + this.getFormatedDate(this.from_date) + "," + this.getFormatedDate(this.to_date) +
      ',' + ',' + ",";
    this.httpService.getByParam(APIURLS.BR_MASTER_VISITOR_BYPARAM_API, searchStr).then((data: any) => {
      if (data) {
        this.visitorsList1 = data;
        this.visitorsList = [];
        if (this.typeOfVisitor == 'previsit') {
          this.visitorsList = this.visitorsList1.filter(s => s.fromTime != null && (s.toTime == null || s.isActive == true));//Pending checkouts
        }
        else if (this.typeOfVisitor == 'bookvisit') {
          this.visitorsList = this.visitorsList1.filter(s => s.isPreShedualled == true);//Today Bookings
        }
        else if (this.typeOfVisitor == 'checkout') {
          this.visitorsList = this.visitorsList1.filter(s => s.toTime != null && s.isActive == false);//Today checkouts
        }
        else if (this.typeOfVisitor == 'revisit') {
          let tempRevisit = [];
          for (let e of this.visitorsList1) {
            let fl = this.visitorsList1.find(s => s.mobile == e.mobile && s.id != e.id && e.isActive == true);
            if (!fl) tempRevisit.push(e);
          }
          this.visitorsList = tempRevisit.filter(s => s.isActive == false);
        }
        else if (this.typeOfVisitor == 'newvisit') {
          this.visitorsList = this.visitorsList1.filter(e => e.fromTime != null);//Today's checkin
        }
        else {
          this.visitorsList = this.visitorsList1;
        }
        this.visitorsList.reverse();
        // console.log(this.visitorsList);
      }
      this.reInitDatatable();
      this.isGetVisitorsListLoading = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.isGetVisitorsListLoading = false;
      this.visitorsList = [];
      this.visitorsList1 = [];
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
  }

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
          // let middleName = this.isEmpty(element.middleName.trim()) ? ' ' : ' ' + element.middleName + ' ';
          t.name = element.firstName + ' ' + element.middleName + ' ' + element.lastName + '-' + element.employeeId + ' (' + element.designation + ')';
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

  public triggerSnapshot(): void {
    this.seconds = 3;
    this.trigger.next();
    this.seconds = null;
  }
  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }
  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  handleImage(webcamImage: WebcamImage) {
    // debugger;
    // console.log('webcm image'+webcamImage);
    this.webcamImage = webcamImage;
    // var FileSaver = require('file-saver');
    var base64 = webcamImage.imageAsBase64;
    // var base64="data:image/jpeg;base64," +webcamImage;
    this.base64 = base64;
    // console.log('base64 image'+base64);

    // Naming the image
    const date = new Date().valueOf();
    let text = '';
    const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(Math.floor(Math.random() * possibleText.length));
    }
    // debugger;
    // Replace extension according to your media type
    // const imageName = date + '_' + text + '.jpeg';
    const imageName = date + '_' + text + '.jpeg';
    // call method that creates a blob from dataUri
    const imageBlob = this.dataURItoBlob(base64);
    this.imageBlob = imageBlob;
    const imageFile = new File([imageBlob], imageName, { type: 'image/jpeg' });
    // console.log(imageFile);
    this.imageFile = imageFile.name;
    this.imageFileContent = imageFile;
    // FileSaver.saveAs(imageFile);

    //copy file to server
    this.formData = new FormData();
    let file: File = imageFile;
    // console.log(file);
    if (file.size > 0) {
      // console.log(file.size); 
      this.file = file;
      this.formData.append('file', file);
    }
    // this.uploadCustInv();
    // FileSaver.saveAs(imageFile);
  }

  CaptureAdditionalImages() {

  }

  handleImageAdd(webcamImage: WebcamImage) {
    // debugger;
    // console.log('webcm image'+webcamImage);
    this.webcamImage = webcamImage;
    // var FileSaver = require('file-saver');
    var base64 = webcamImage.imageAsBase64;
    // var base64="data:image/jpeg;base64," +webcamImage;
    this.base64 = base64;
    // console.log('base64 image'+base64);

    // Naming the image
    const date = new Date().valueOf();
    let text = '';
    const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(Math.floor(Math.random() * possibleText.length));
    }
    // debugger;
    // Replace extension according to your media type
    // const imageName = date + '_' + text + '.jpeg';
    const imageName = date + '_' + text + '.jpeg';
    // call method that creates a blob from dataUri
    const imageBlob = this.dataURItoBlob(base64);
    this.imageBlob = imageBlob;
    const imageFile = new File([imageBlob], imageName, { type: 'image/jpeg' });
    // console.log(imageFile);
    this.imageFile = imageFile.name;
    this.imageFileContent = imageFile;
    // FileSaver.saveAs(imageFile);

    //copy file to server
    this.formData = new FormData();
    let file: File = imageFile;
    // console.log(file);
    if (file.size > 0) {
      // console.log(file.size);
      this.file = file;
      this.formData.append('file', file);
    }
    // this.uploadCustInv();
    // FileSaver.saveAs(imageFile);
  }

  uploadCustInv() {
    // debugger;
    let connection: any;
    //this.isLoading = true;
    // console.log('this.employeeId');
    // console.log(this.formData);
    // connection = this.httpService.postforCustFileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, +this.employeeId, this.formData);
    // console.log(this.imageFileContent);

    // connection = this.httpService.postforCustFileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, this.vid , this.imageFileContent);
    connection = this.httpService.postforCustFileUpload(APIURLS.BR_MASTER_FILEUPLOAD_API, this.vid, this.formData);
    connection.then((data: any) => {
      this.isLoading = false;
      if (data == 200) {
        // console.log('copied file to server')
        this.imageFlag = true;
      }
    }).catch(error => {
      this.errMsg = 'Error uploading file ..';
    });

  }

  dataURItoBlob(dataURI) {
    // console.log(dataURI);
    const byteString = window.atob(dataURI);
    // const byteString = atob(dataURI.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    // var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // console.log(mimeString);
    // const blob = new Blob([int8Array], { type: mimeString  });
    return blob;
  }
  //multiselect

  onItemSelect(item: any) {
    // debugger;
    if (item.name.toLowerCase() == "others") {
      this.show_Others = true;
      this.requireState = true;
    }
    // console.log(this.selectedBelongings);
    // this.selectedBelongings.push(item);
    // console.log(this.selectedBelongings);
  }
  onItemDeSelect(item: any) {
    // debugger;
    //  console.log(item);
    if (item.name.toLowerCase() == "others") {
      this.show_Others = false;
      this.calendarItem.temp9 = "";
      this.requireState = false;
    }
  }

  onItemSelect1(item: any) {
    // console.log(item);
    // this.selParentRole.push(item);
  }
  onSelectAll(items: any) {
    //debugger;
    //  console.log(items);
    items.forEach(item => {
      if (item.name.toLowerCase() == "others") {
        this.show_Others = true;
        this.requireState = true;
      }
    });
  }
  onDeSelectAll(items: any) {
    this.show_Others = false;
    this.calendarItem.temp9 = "";
    this.requireState = false;
  }

  onFocus() {
    this.autocompleteTrigger._onChange('');
    this.autocompleteTrigger.openPanel();
  }

  qrCodeURL: string;
  PlantCode: string;
  printSetup(user) {
    // debugger;
    this.downloadImage(user.id);
    this.printItem = user;
    this.stringQrCode = this.printItem.id + this.printItem.mobile;
    this.qrCodeURL = 'https://api.qrserver.com/v1/create-qr-code/?data=' + this.stringQrCode + '&amp;size=50x50';
    this.printedOn = new Date().toLocaleDateString('en-GB');

    jQuery("#aModal").modal('hide');
    jQuery("#sModal").modal('show');
    // this.print();
  }

  getBaseLocation() {
    this.isLoadPop = true;
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, this.currentUser.baselocation).then((data: any) => {
      if (data) {
        this.PlantCode = data ? data.code + "-" + data.name : "";
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.PlantCode = "";
    });
  }

  image: any;
  imageStore = [];
  downloadImage(id) {
    let filename = this.imageStore.find(s => s.id == id).imgpath;
    let folder = this.imageStore.find(s => s.id == id).folder;

    // **************************************************
    // CODE ONLY FOR DEV. DO NOT PUSH TO PROD.
    // **************************************************
    // BEGIN
    // filename = "image01";
    // folder = 2;
    // END

    if (filename != null && filename.length > 0) {
      this.httpService.getImageFile(APIURLS.BR_VMS_FILEDOWNLOAD_API, folder, filename).then((data: any) => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(data);
        reader.onload = (event: any) => {
          this.image = event.target.result;
        };
        jQuery("#sModal").modal('show');
      }).catch(error => {
        console.log(error);
        this.isLoading = false;
      });
    } else {
      swal({
        title: "Message",
        text: "No image found.",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      }).then((willDelete) => {
        if (willDelete) {
          this.isLoading = false;
        }
      });
    }
  }
  AdditionalVisitorsList: AdditionalVisitor[] = [];
  printall(value) {
    // console.log(value);
    this.imageStore = [];
    this.AdditionalVisitorsList = [];
    if (value.numberOfPerson > 1) {
      this.httpService.getById(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_ANY_API, value.id).then((data: any) => {
        if (data.length > 0) {
          this.AdditionalVisitorsList = data;
          for (var i = 0; i < this.AdditionalVisitorsList.length; i++) {
            this.AdditionalVisitorsList[i].fromTime = value.fromTime;
            this.AdditionalVisitorsList[i].date = value.date;
            this.AdditionalVisitorsList[i].fkEmployeeName = value.fkEmployeeName;
            this.AdditionalVisitorsList[i].numberOfPerson = value.numberOfPerson;
            // this.AdditionalVisitorsList[i].id = value.id;
            this.AdditionalVisitorsList[i].visitorPurpose = value.visitorPurpose;
            this.AdditionalVisitorsList[i].dept = value.dept;
            // this.AdditionalVisitorsList[i].temp2 = value.temp2;
          }

          this.AdditionalVisitorsList.forEach(element => {
            let im = { id: 0, imgpath: '', folder: 0 };
            im.id = element.id;
            im.imgpath = element.temp3;
            im.folder = value.id;
            this.imageStore.push(im);
          });

          this.AdditionalVisitorsList.push(value);
          let im = { id: 0, imgpath: '', folder: 0 };
          im.id = value.id;
          im.imgpath = value.temp;
          im.folder = value.id;
          this.imageStore.push(im);

          jQuery("#aModal").modal('show');
        }
        else {
          let im = { id: 0, imgpath: '', folder: 0 };
          im.id = value.id;
          im.imgpath = value.temp;
          im.folder = value.id;
          this.imageStore.push(im);
          this.printSetup(value);
        }
        this.isLoading = false;
      }).catch(error => {
        console.log(error);
        this.isLoading = false;
        this.AdditionalVisitorsList = [];
      });

    }
    else {
      let im = { id: 0, imgpath: '', folder: 0 };
      im.id = value.id;
      im.imgpath = value.temp;
      im.folder = value.id;
      this.imageStore.push(im);
      this.printSetup(value);
    }
  }

  printusers(value) {
    if (value.numberOfPerson > 1 && this.AdditionalVisitorsList.length > 0) {
      this.AdditionalVisitorsList;
      jQuery("#sModal").modal('hide');
      jQuery("#aModal").modal('show');
    }
    else {
      jQuery("#sModal").modal('hide');
    }

  }

  onPrint() {
    window.print();
  }

  printedOn: any;
  print(): void {
    let printContents, popupWin;
    this.printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <title>Visitor Pass</title>
          <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
          <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
          <style>
          html{
              zoom: 0.6; 
              transform-origin: 100%;            
          }
          </style>
        </head>
        <body onload="window.print();window.close()">
        <table class="report-container" style="width: 5in; height: 4in; ">
          <thead class="report-header">
            <tr>
              <th class="report-header-cell">
               
              </th>
            </tr>
          </thead>
          <tbody class="report-content table-bordered table-striped">
            <tr>
              <td class="report-content-cell">
                <div class="main">
                ${this.printContents}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </body>
      </html>`
    );
    popupWin.document.close();
  }


  ngAfterViewInit() {
    this.setupDevices();
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

  isValid: boolean = false;
  validatedForm: boolean = true;
  notFirst = true;
  notFirst1 = true;

  checkStatus() {
    // console.log(this.selParentRole.length+'<->'+this.notFirst);
    // console.log('item:'+this.selParentRole);
    if (this.selParentRole == null || this.selParentRole == '' || this.selParentRole == undefined) this.notFirst = false;
  }

  checkStatus1() {
    // console.log(this.selectedBelongings.length+'<->'+this.notFirst);
    if (this.selectedBelongings.length <= 0) this.notFirst1 = false;
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


  openEntry(isEdit, data: Visitor) {
    // debugger;
    this.isLoadingPop = true;
    this.empMListCon1 = this.empMListCon;
    this.userForm.form.markAsPristine();
    this.userForm.form.markAsUntouched();
    this.userForm.form.updateValueAndValidity();
    this.errMsgPop = '';
    this.isEdit = isEdit;
    this.deletedPersonIds = [];
    this.personIds = [];
    this.Approverslist = [];
    this.person = [];
    this.VisitorDetails = [];
    // this.searchTerm.setValue('');
    this.selectedVisitorType = null;
    this.selectedPurpose = null;
    this.additionalPersons = [];
    this.selectedBelongings = [];
    this.selectedAddBelongings = [];
    this.selectedNonBelongings = [];
    this.selectedAddNonBelongings = [];
    this.selParentRole = [];
    this.personToMeetType = 1;
    this.d = new Date();
    this.imageFlag = false;
    this.imageFile = '';
    this.recCount = 0;
    this.webcamImage = null;
    // console.log(this.empMListCon1);
    this.notFirst = true;
    this.notFirst1 = true;
    this.show_Others = false;
    this.showWebcam = true;
    this.captures = [];
    // this.typeOfVisitor = 'newvisit';
    if (this.isEdit) {
      // this.typeOfVisitor = 'bookvisit';
      Object.assign(this.calendarItem, data);
      //this.calendarItem = data;

      this.calendarItem.numberOfPerson = (this.calendarItem.numberOfPerson <= 0) ? 1 : this.calendarItem.numberOfPerson;
      this.personToMeetType = this.calendarItem.temp3 ? +this.calendarItem.temp3 : 1;
      if (this.personToMeetType == 1) {
        let val = this.calendarItem.fkEmployeeId.split(',')
        for (let i = 0; i < val.length; i++) {
          this.selParentRole.push(this.empMList.find(e => e.employeeId == val[i]).id);
        }
        let te = this.empMList.find(s => s.employeeId == this.calendarItem.fkEmployeeId);
        // this.selParentRole = te? this.empMListCon1.filter(s=>s.id==te.id):[];
        this.getApproversDetails(this.selParentRole[0]);
        this.imageFlag = this.calendarItem.temp ? true : false;
      }

      else {
        this.selParentRole = [];
        // this.personToMeetType = 2;
      }
      this.selectedVisitorType = this.visitorTypeList.find(s => s.id == this.calendarItem.fkVisitorType);
      this.selectedPurpose = this.purposeList.find(s => s.id == this.calendarItem.fkVisitorPurpose);
      var belongingsList = this.calendarItem.temp2 ? this.calendarItem.temp2.split(',') : [];
      this.selectedBelongings = this.belongings.filter(s => belongingsList.includes(s.name));

      var belongingsList1 = this.calendarItem.temp15 ? this.calendarItem.temp15.split(',') : [];
      this.selectedNonBelongings = this.belongings.filter(s => belongingsList1.includes(s.name));
      this.httpService.getById(APIURLS.GET_VISITOR_BELONGINGS, this.calendarItem.id).then((data) => {
        if (data) {
          let visitr: any = {};
          visitr.name = this.calendarItem.name;
          visitr.mobile = this.calendarItem.mobile;
          visitr.email = this.calendarItem.email;
          visitr.companyName = this.calendarItem.companyName;
          visitr.carrying = this.calendarItem.temp17;
          visitr.BelongingsList = data.filter(x => x.visitorName == this.calendarItem.name && x.mobileNo == this.calendarItem.mobile);
          visitr.count = visitr.BelongingsList.length
          this.VisitorDetails.push(visitr);

          if (this.calendarItem.temp9 != null && this.calendarItem.temp9 != "")
            this.show_Others = true;
          // console.log(this.selectedBelongings);

          this.httpService.getById(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_ANY_API, this.calendarItem.id).then((data_nxyr: any) => {
            if (data_nxyr.length > 0) {
              this.additionalPersons = data_nxyr;
              this.showTable = true;
              // console.log(this.additionalPersons);
              // debugger;

              for (let des of this.additionalPersons) {
                var nextY = { 'id': 0, 'name': '', 'temp1': '', 'phone': '', 'email': '', 'temp2': '', 'temp3': '', 'temp5': '', 'BelongingsList': [], 'count': null, 'selectedAddBelongings': [], 'selectedAddNonBelongings': [] };
                nextY.id = des.id;
                nextY.name = des.name;
                nextY.temp1 = des.temp1;
                nextY.phone = des.mobile;
                nextY.email = des.email;

                let vis = {} as VisitorDetails;
                vis.id = des.id;
                vis.name = des.name;
                vis.mobile = des.mobile;
                vis.email = des.email;
                vis.companyName = des.companyName;
                vis.carrying = des.temp5;
                var belongingsList = des.temp2 ? des.temp2.split(',') : [];
                vis.BelongingsList = this.belongings.filter(s => belongingsList.includes(s.name));;
                nextY.selectedAddBelongings = this.belongings.filter(s => belongingsList.includes(s.name));
                var belongingsList = des.temp4 ? des.temp4.split(',') : [];
                nextY.selectedAddNonBelongings = this.belongings.filter(s => belongingsList.includes(s.name));
                nextY.temp3 = des.temp3;
                vis.BelongingsList = data.filter(x => x.visitorName == des.name && x.mobileNo == des.mobile);
                vis.count = vis.BelongingsList.length
                this.person.push(nextY);
                this.personIds.push(des.id);
                this.VisitorDetails.push(vis);
              }
              // console.log(this.person);
              this.recCount = this.person.length;
              // console.log(this.recCount+'-'+this.calendarItem.numberOfPerson);
            }

          }).catch(error => {
            //this.isLoadingPop = false;
            this.errMsgPop = 'Error getting additional person details: ' + error;
          });
        }
      });
    }
    else {
      // this.calendarItem = new Visitor(0, '', '', '', '', '', '', '', '', true, '', '', '', '', true, false, 0, 0, '', 0, '', true, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '91', '', 0, 0, '', '', '');
      this.calendarItem = {
        id: 0,
        isCancelled: true,
        isApproved: true,
        isPreShedualled: false,
        numberOfPerson: 0,
        createdBy: this.currentUser.fkEmpId,
        modifiedBy: 0,
        isActive: true,
        temp1: '91',
        fkVisitorType: 0,
        fkVisitorPurpose: 0
      } as Visitor;
      
      this.personToMeetType = 1;
      this.deletedPersonIds = [];
      this.personIds = [];
      this.selectedVisitorType = null;
      this.selectedPurpose = null;
      this.selectedBelongings = [];
      this.selectedNonBelongings = [];
    }
    this.isSaved = false;

    this.isLoadingPop = false;
    jQuery("#myModal").modal('show');

  }
  getDesignation(id) {
    // console.log(id);
    return this.designationList.find(s => s.id === id).name;
  }

  getStatus(mobile) {
    return this.visitorsList.some(s => s.mobile == mobile && s.isActive == true);
  }
  rescheduleEntry(isEdit, data: Visitor) {
    this.calendarItem = data;
    this.isEdit = isEdit;
    this.isSaved = false;
    // this.searchTerm.setValue('');
    this.deletedPersonIds = [];
    this.personIds = [];
    this.person = [];
    this.showTable = false;
    this.selectedVisitorType = this.visitorTypeList.find(s => s.id == 1);
    this.selectedPurpose = this.purposeList.find(s => s.id == 1);
    this.personToMeetType = 1;
    this.calendarItem.numberOfPerson = 1;
    this.calendarItem.temp = '';
    this.imageFlag = false;
    // this.selectedBelongings.splice(0);
    this.selectedBelongings = [];
    this.selectedNonBelongings = [];

    //  this.selParentRole = this.empMList.find(s=>s.firstName == this.calendarItem.fkEmployeeName);
    // console.log('reschedule:'+this.selParentRole);

    // var str = this.selParentRole.firstName + ' - ' + this.selParentRole.employeeId + ' - ' + this.selParentRole.designation
    //                 + ' - '+this.selParentRole.baseLocation;
    //          var newOption = new Option(str, this.selParentRole.id, true,true );
    //         $('#dParentId').append(newOption).trigger('change');
    // console.log('reschedule after:'+this.selParentRole);

    jQuery("#myModal").modal('show');
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
    this.getBelongingsChecklist(this.calendarItem.id);
    this.scannedCode = (this.calendarItem.id + this.calendarItem.mobile);
    // console.log(this.calendarItem.id+''+this.calendarItem.mobile);
    this.isLoadingPop = false;
    jQuery("#checkoutModal").modal('show');
  }

  IndividualCheckoutList: any[] = [];
  GetIndividualCheckoutList(user) {
    let connection: any;
    connection = this.httpService.getById(APIURLS.GET_VISITOR_BELONGINGS, user.id);
    connection.then((data) => {
      if (data) {
        this.BelongingsCheckList = data.filter(x => x.checkoutDate == null);
        var list = this.BelongingsCheckList.map(item => item.visitorName)
          .filter((value, index, self) => self.indexOf(value) === index)
        this.IndividualCheckoutList = list;
        jQuery("#IcheckoutModal").modal('show');
      }
    }).catch((error) => {
      this.BelongingsCheckList = [];
    })

  }


  getBelongingsChecklist(id) {
    let connection: any;
    connection = this.httpService.getById(APIURLS.GET_VISITOR_BELONGINGS, id);
    connection.then((data) => {
      if (data) {
        this.BelongingsCheckList = data.filter(x => x.checkoutDate == null && x.type == 'Returnable');
        this.processData();
      }
    }).catch((error) => {
      this.BelongingsCheckList = [];
    })
  }

  dataExt: any[] = [];

  private processData() {
    const namessSeen = {};

    this.dataExt = this.BelongingsCheckList.sort((a, b) => {
      const stateComp = a.visitorName.localeCompare(b.visitorName);
      return stateComp;
    }).map(x => {
      const nameSpan = namessSeen[x.visitorName] ? 0 :
        this.BelongingsCheckList.filter(y => y.visitorName === x.visitorName).length;

      namessSeen[x.visitorName] = true;
      return { ...x, nameSpan };
    });
  }


  isMasterSel: boolean = false;
  checkUncheckAll() {
    for (var i = 0; i < this.dataExt.length; i++) {
      this.dataExt[i].checkout = this.isMasterSel;
    }
    this.getCheckedItemList();
  }
  isAllSelected() {
    this.isMasterSel = this.dataExt.every(function (item: any) {
      return item.checkout == true;
    })
    this.getCheckedItemList();
  }
  checkedRequestList: any[] = [];
  checkedlist: any[] = [];
  getCheckedItemList() {
    this.checkedRequestList = [];
    this.checkedlist = [];
    for (var i = 0; i < this.dataExt.length; i++) {
      if (this.dataExt[i].checkout) {
        this.dataExt[i].endDateTime = new Date();
        this.checkedlist.push(this.dataExt[i]);
      }
      else {
        this.dataExt[i].endDateTime = null;
      }

    }
    this.checkedRequestList = this.checkedlist;
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
    if (this.isMasterSel == false && this.checkedRequestList.length > 0) {
      this.onPartialcheckout();
    }
    else if (this.isMasterSel == false && this.checkedRequestList.length <= 0 && this.dataExt.length > 0) {
      this.completevisitpartially();
    }
    else {
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
              jQuery("#saveModal").modal('show');
              this.isLoadingPop = false;
              this.isLoading = false;
              if (this.checkedRequestList.length > 0) {
                this.onPartialcheckout();
              }
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
  }

  completevisitpartially() {
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
        // this.calendarItem.isActive = false;
        let connection: any;
        connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
        connection.then((data: any) => {
          // this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            // jQuery("#myModal").modal('hide');
            this.errMsgPop1 = 'Checkout complete';
            jQuery("#checkoutModal").modal('hide');
            jQuery("#saveModal").modal('show');
            this.isLoadingPop = false;
            this.isLoading = false;
            if (this.checkedRequestList.length > 0) {
              this.onPartialcheckout();
            }
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

    if (this.calendarItem.numberOfPerson <= 0) {
      swal({
        title: "Message",
        text: "Please enter number of persons.",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      })
      return;
    }
    else if (this.calendarItem.numberOfPerson != this.VisitorDetails.length) {
      swal({
        title: "Message",
        text: "Please enter all the visitor details",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      })
      return;
    }

    else if (this.Approverslist.length == 0) {
      swal({
        title: "Message",
        text: "Approvers not defined.",
        icon: "warning",
        dangerMode: false,
        buttons: [false, true]
      })
    }
    else {
      for (let i = 0; i < this.VisitorDetails.length; i++) {
        if ((this.VisitorDetails[i].BelongingsList == undefined || this.VisitorDetails[i].BelongingsList.length <= 0)
          && this.VisitorDetails[i].carrying == 'Yes') {
          swal({
            title: "Message",
            text: "Please enter belongings for " + this.VisitorDetails[i].name,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
          return;
        } else if ((this.VisitorDetails[i].mobile == null || this.VisitorDetails[i].mobile == "") && this.calendarItem.fkVisitorType != 14) {
          // console.log(this.calendarItem.fkVisitorType);
          swal({
            title: "Message",
            text: "Please enter the mobile number for " + this.VisitorDetails[i].name,
            icon: "warning",
            dangerMode: false,
            buttons: [false, true]
          })
          return;
        }
        for (let j = i + 1; j < this.VisitorDetails.length; j++) {
          if ((this.VisitorDetails[i].name == this.VisitorDetails[j].name) && (this.VisitorDetails[i].mobile == this.VisitorDetails[j].mobile)) {
            swal({
              title: "Message",
              text: "Name or mobile number cannot be same for two visitors.",
              icon: "warning",
              dangerMode: false,
              buttons: [false, true]
            })
            return;
          }
        }
      }
      // console.log(this.VisitorDetails);
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

      //  this.calendarItem.fkVisitorType = this.selectedVisitorType.id;
      this.calendarItem.fkVisitorPurpose = this.selectedPurpose.id;
      if (this.personToMeetType == 1) {
        let tem = this.empMList.find(s => s.id == this.selParentRole[0]);
        this.calendarItem.fkEmployeeId = tem.employeeId;
        this.calendarItem.temp8 = tem.baseLocation;

        this.calendarItem.fkEmployeeName = tem.firstName + ' ' + tem.lastName;
        this.calendarItem.employeeEmail = tem.email;
        for (let i = 1; i < this.selParentRole.length; i++) {
          let tem1 = this.empMList.find(s => s.id == this.selParentRole[i]);
          this.calendarItem.fkEmployeeId = this.calendarItem.fkEmployeeId + ',' + tem1.employeeId;
          this.calendarItem.temp8 = this.calendarItem.temp8 + ',' + tem1.baseLocation;

          this.calendarItem.fkEmployeeName = this.calendarItem.fkEmployeeName + ',' + tem1.firstName + ' ' + tem1.lastName;
          this.calendarItem.employeeEmail = this.calendarItem.employeeEmail + ',' + tem1.email;
        }
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
      this.calendarItem.name = this.VisitorDetails[0].name;
      this.calendarItem.companyName = this.VisitorDetails[0].companyName;
      this.calendarItem.mobile = this.VisitorDetails[0].mobile;
      this.calendarItem.email = this.VisitorDetails[0].email;
      this.calendarItem.temp = this.VisitorDetails[0].image;
      this.calendarItem.temp17 = this.VisitorDetails[0].carrying;

      //save belongings
      //this.calendarItem.temp2 = this.selectedBelongings.map(x => x.name).join();
      var belong = this.VisitorDetails[0].BelongingsList ? this.VisitorDetails[0].BelongingsList.filter(x => x.type == "Returnable") : [];
      this.calendarItem.temp2 = belong.length > 0 ? belong.map(x => x.belongings).join() : '';
      //  this.calendarItem.temp15 = this.selectedNonBelongings.map(x => x.name).join();
      var NonRetbelong = this.VisitorDetails[0].BelongingsList ? this.VisitorDetails[0].BelongingsList.filter(x => x.type == "Non Returnable") : [];
      this.calendarItem.temp15 = NonRetbelong.length > 0 ? NonRetbelong.map(x => x.belongings).join() : '';

      //Code added for VMS Approval
      if (!this.calendarItem.isPreShedualled) {
        if (this.getType(this.calendarItem.fkVisitorType) != "Employee") {
          this.calendarItem.temp13 = 'Pending For Approval.';
          this.calendarItem.temp14 = this.Approverslist[0].approverId;
        }
        else {
          this.calendarItem.temp13 = 'Approved';
        }
      }
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
          //this.calendarItem.temp = this.imageFile ? this.imageFile : this.calendarItem.temp;

          connection = this.httpService.put(APIURLS.BR_MASTER_VISITOR_POST_API, this.calendarItem.id, this.calendarItem);
          this.visitorId1 = this.calendarItem;
          // this.errMsgPop1 = 'Appointment updated!';
        }
        else {
          // this.calendarItem.temp = this.imageFile ? this.imageFile : '';
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
            // console.log('imageFile'+this.imageFile);

            this.cal_id = data.id > 0 ? data.id : this.calendarItem.id;
            this.vid = data.id > 0 ? data.id : this.calendarItem.id;
            if (this.VisitorDetails[0].BelongingsList != undefined && this.VisitorDetails[0].BelongingsList.length > 0) {
              this.InsertAdditionalVisitorBelongings(this.VisitorDetails[0].BelongingsList, this.VisitorDetails[0])
            }

            if (this.calendarItem.temp != '')
              this.uploadCustInv();

            if (this.VisitorDetails.length > 1) {
              for (let i = 1; i < this.VisitorDetails.length; i++) {
                if (this.VisitorDetails[i].name != '' || this.VisitorDetails[i].name != null) {
                  var nextY = { 'id': 0, 'name': '', 'temp1': '', 'mobile': '', 'email': '', 'companyName': '', 'temp2': '', 'temp3': '', 'temp5': '', 'temp4': '', 'fkId': 0 };
                  // console.log('->'+this.nextYr[i].closure_date);
                  nextY.fkId = this.cal_id;
                  nextY.name = this.VisitorDetails[i].name;
                  nextY.temp1 = '91';
                  nextY.companyName = this.VisitorDetails[i].companyName;
                  nextY.mobile = this.VisitorDetails[i].mobile;
                  nextY.email = this.VisitorDetails[i].email;
                  nextY.temp5 = this.VisitorDetails[i].carrying;

                  if (nextY.temp5.toLocaleLowerCase() == "yes") {
                    this.InsertAdditionalVisitorBelongings(this.VisitorDetails[i].BelongingsList, this.VisitorDetails[i]);
                    if (this.VisitorDetails[i].BelongingsList != undefined && this.VisitorDetails[i].BelongingsList.length > 0) {
                      var belong = this.VisitorDetails[i].BelongingsList ? this.VisitorDetails[i].BelongingsList.filter(x => x.type == "Returnable") : [];
                      nextY.temp2 = belong.length > 0 ? belong.map(x => x.belongings).join() : '';

                      if (this.selectedAddBelongings.length > 0) {
                        this.selectedAddNonBelongings = this.VisitorDetails[i].BelongingsList.filter(x => x.type == 'Non Returnable');
                      }
                        
                      nextY.temp4 = this.selectedAddNonBelongings.length > 0 ? this.selectedAddNonBelongings.map(x => x.belongings).join() : null;
                    }
                  }

                  nextY.temp3 = this.VisitorDetails[i].image;

                  let createupdateflag = this.personIds.some(s => s == this.VisitorDetails[i].id);
                  if (createupdateflag) {
                    nextY.id = this.VisitorDetails[i].id;
                    connection = this.httpService.put(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_POST_API, this.cal_id, nextY);
                  }
                  else {
                    connection = this.httpService.post(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_POST_API, nextY);
                  }
                }

                if (this.deletedPersonIds.length > 0) {
                  this.deletedPersonIds.forEach(element => {
                    let findOldIdNext = this.deletedPersonIds.some(s => s == element);
                    if (findOldIdNext) {
                      connection = this.httpService.delete(APIURLS.BR_MASTER_ADDITIONAL_VISITOR_POST_API, element);
                    }
                  });
                }
              }
            }

            jQuery("#myModal").modal('hide');
            var tempText = '';
            tempText = (this.calendarItem.temp == '' || this.calendarItem.temp == undefined) ? 'But you will not be able to print pass as you missed clicking visitors picture' : '';
            // console.log(this.calendarItem.temp);
            this.errMsgPop1 = 'Visitor Entry Saved!' + tempText;
            //this.InsertBelongings();
            this.isSaved = true;
            this.isLoading = false;
            this.isLoadingPop = false;
            if (this.getType(this.calendarItem.fkVisitorType) != "Employee") {
              if (data.id > 0) {
                for (var i = 0; i < this.Approverslist.length; i++) {
                  this.visitorId.temp14 = this.Approverslist[i].approverId;
                  this.sendVisitorApprovalMail(this.visitorId)
                }
              }
              else {
                for (var i = 0; i < this.Approverslist.length; i++) {
                  this.calendarItem.temp14 = this.Approverslist[i].approverId;
                  this.sendVisitorApprovalMail(this.calendarItem)
                }
              }
            }
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
let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authData.token
        });
        return { headers: headers };
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


  GetVisitorDetails(visit, i) {
    var self = this;
    $('#visitor_' + i).autocomplete({
      source: function (request, response) {
        var searchTerm1 = request.term + ',' + self.currentUser.baselocation;
        let connection = self.httpService.getByParam(APIURLS.BR_GET_VISITOR_BASED_ON_NAME, searchTerm1);
        connection.then((data: any) => {
          if (data) {
            let result = data;
            response(result.map((i) => {
              i.label = i.name + '-' + i.mobile + '-' + i.companyName, i.name = i.name, i.mobile = i.mobile
                , i.companyName = i.companyName, i.email = i.email; return i;
            }));
          }
        }).catch(error => {
        });
      },
      select: function (event, ui) {
        visit.name = ui.item.name;
        visit.mobile = ui.item.mobile;
        visit.companyName = ui.item.companyName;
        visit.email = ui.item.email;
        return false;
      }
    });

  }

  GetEmployeeDetails(visit, i) {
    var self = this;
    $('#EmployeeID_' + i).autocomplete({
      source: function (request, response) {
        var searchTerm1 = request.term + ',' + self.currentUser.baselocation;
        let connection = self.httpService.get(APIURLS.BR_GET_EMPLOYEE_BASED_ON_SEARCHTEXT + "/" + request.term)
        connection.then((data: any) => {
          if (data) {
            let result = data;
            response(result.map((i) => {
              // i.label = i.name + '-' + i.mobile + '-' + i.companyName, i.name = i.name, i.mobile = i.mobile
              //  , i.companyName = i.companyName, i.email = i.email; return i;
              i.label = i.fullName + " (" + i.employeeId + ")", i.value = i.employeeId, i.name = i.name,
                i.mobile = i.mobileNo,
                i.email = i.emailId, i.plant = i.plant; return i;
            }));
          }
        }).catch(error => {
        });
      },
      select: function (event, ui) {
        visit.name = ui.item.name;
        visit.mobile = ui.item.mobile;
        visit.companyName = ui.item.plant;
        visit.email = ui.item.email;
        return false;
      }
    });

  }

  lastReportingkeydown1 = 0;
  getvisitordetails($event, i) {
    let self = this;
    // let text = $('#empNo'+i).val();

    let text = this.VisitorDetails[i].name;
    if (text.length > 3) {
      if ($event.timeStamp - this.lastReportingkeydown1 > 400) {
        var searchTerm1 = text + ',' + self.currentUser.baselocation;
        let connection = self.httpService.getByParam(APIURLS.BR_GET_VISITOR_BASED_ON_NAME, searchTerm1);
        connection.then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return {
                label: item.name + '-' + item.mobile + '-' + item.companyName,
                mobile: item.mobile, name: item.name,
                email: item.email, plant: item.companyName,
                additional: item.additionalVisitors
              };
            })
            $('#visitor_' + i).autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },

              change: function (event, ui) {
                if (ui.item) {
                  $("#visitor_" + i).val(ui.item.name);
                  $("#mobile_" + i).val(ui.item.mobile);
                  $("#email_" + i).val(ui.item.email);
                  $("#companyName_" + i).val(ui.item.plant);
                  if (ui.item.additional.length > 0 && self.calendarItem.numberOfPerson > 1) {
                    swal({
                      title: "Message",
                      text: "Additional visitors available for this visitor, Do you want to copy them ?.",
                      icon: "info",
                      dangerMode: false,
                      buttons: [true, true]
                    }).then((willDelete) => {
                      if (willDelete) {
                        this.isLoading = false;
                        self.MapAdditional(ui.item.additional);
                      }
                    });
                  }
                  //this.interviewerList[i].employeeName = ui.item.label;
                  //this.interviewerList[i].employeeId = ui.item.value;
                }
                else {
                  $("#visitor_" + i).val('');
                  $("#mobile_" + i).val('');
                  $("#email_" + i).val('');
                  $("#companyName_" + i).val('');
                  //this.interviewerList[i].employeeName = '';
                  //this.interviewerList[i].employeeId = '';
                }
              },

              select: function (event, ui) {
                if (ui.item) {
                  $("#visitor_" + i).val(ui.item.name);
                  $("#mobile_" + i).val(ui.item.mobile);
                  $("#email_" + i).val(ui.item.email);
                  $("#companyName_" + i).val(ui.item.plant);

                  //this.interviewerList[i].employeeName = ui.item.label;
                  //this.interviewerList[i].employeeId = ui.item.value;
                }
                else {
                  $("#visitor_" + i).val('');
                  $("#mobile_" + i).val('');
                  $("#email_" + i).val('');
                  $("#companyName_" + i).val('');
                  //this.interviewerList[i].employeeName = '';
                  //this.interviewerList[i].employeeId = '';
                }
                return false;
              }
            });
          }
        });
      }
      this.lastReportingkeydown1 = $event.timeStamp;
    }
  }

  MapAdditional(list) {

    for (let i = 0; i < list.length; i++) {
      let visitor: any = {};
      visitor.name = list[i].name;
      visitor.mobile = list[i].mobile;
      visitor.email = list[i].email;
      visitor.companyName = list[i].companyName;
      this.VisitorDetails.push(visitor);
    }

  }


  lastReportingkeydown = 0;
  getpersonResponsible($event, i) {
    let self = this;
    // let text = $('#empNo'+i).val();

    let text = this.VisitorDetails[i].name;
    if (text.length > 3) {
      $('#EmployeeID_' + i).autocomplete({
        source: function (request, response) {
          self.httpService.get(APIURLS.BR_GET_EMPLOYEE_BASED_ON_SEARCHTEXT + "/" + request.term).then((data: any) => {
            if (data.length > 0) {

              var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
              response(sortedList.map((item) => {
                item.label = item.fullName + " (" + item.employeeId + ")", item.value = item.employeeId, item.name = item.name,
                  item.mobile = item.mobileNo,
                  item.email = item.emailId, item.plant = item.plant; return i;
              }));
            }
          }).catch(error => {
          });
          //   if (data.length > 0) {
          //     var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
          //     var list = $.map(sortedList, function (item) {
          //       return {
          //         label: item.fullName + " (" + item.employeeId + ")", value: item.employeeId, name: item.name, mobile: item.mobileNo,
          //         email: item.emailId, plant: item.plant
          //       };
          //     })
          //     $('#EmployeeID_' + i).autocomplete({
          //       source: list,
          //       classes: {
          //         "ui-autocomplete": "highlight",
          //         "ui-menu-item": "list-group-item"
          //       },
          //       change: function (event, ui) {
          //         if (ui.item) {
          //           this.VisitorDetails[i].name = ui.item.name;
          //           this.VisitorDetails[i].mobile = ui.item.mobile;
          //           this.VisitorDetails[i].companyName = ui.item.companyName;
          //           this.VisitorDetails[i].email = ui.item.email;
          //           //this.interviewerList[i].employeeName = ui.item.label;
          //           //this.interviewerList[i].employeeId = ui.item.value;
          //         }
          //         else {
          //           $("#EmployeeID_" + i).val('');
          //           $("#mobile_" + i).val('');
          //           $("#email_" + i).val('');
          //           $("#companyName_" + i).val('');
          //           //this.interviewerList[i].employeeName = '';
          //           //this.interviewerList[i].employeeId = '';
          //         }
          //       },
          //       select: function (event, ui) {
          //         if (ui.item) {
          //           this.VisitorDetails[i].name = ui.item.name;
          //           this.VisitorDetails[i].mobile = ui.item.mobile;
          //           this.VisitorDetails[i].companyName = ui.item.companyName;
          //           this.VisitorDetails[i].email = ui.item.email;
          //           //this.interviewerList[i].employeeName = ui.item.label;
          //           //this.interviewerList[i].employeeId = ui.item.value;
          //         }
          //         else {
          //           $("#EmployeeID_" + i).val('');
          //           $("#mobile_" + i).val('');
          //           $("#email_" + i).val('');
          //           $("#companyName_" + i).val('');
          //           //this.interviewerList[i].employeeName = '';
          //           //this.interviewerList[i].employeeId = '';
          //         }
          //         return false;
          //       }
          //     });
        },
        select: function (event, ui) {
          this.VisitorDetails[i].name = ui.item.name;
          this.VisitorDetails[i].mobile = ui.item.mobile;
          this.VisitorDetails[i].companyName = ui.item.companyName;
          this.VisitorDetails[i].email = ui.item.email;
          return false;
        }
      });
      //}
      this.lastReportingkeydown = $event.timeStamp;
    }
  }

  VisitorBelongingId: any;
  AddBelongings(i) {
    this.VisitorBelongingId = i;
    this.BelongingsList = this.VisitorDetails[i].BelongingsList;
    jQuery("#BelongingsModal").modal('show');
  }
  closeBelongingModal() {
    jQuery("#BelongingsModal").modal('hide');
  }

  sendVisitorApprovalMail(data) {
    let connection: any;
    connection = this.httpService.sendPutMail(APIURLS.BR_SEND_VISITOR_APPROVAL_MAIL, 'Visitor-Approval', data);
    connection.then((data: any) => {
      if (data == 200) {
      }
    }).catch(error => {
      this.errMsgPop = 'Error in sending mail..';
    });
  }

  WIDTH = 240;
  HEIGHT = 160;

  @ViewChild("video")
  public video: ElementRef;

  @ViewChild("canvas")
  public canvas: ElementRef;

  captures: string[] = [];
  error: any;
  isCaptured: boolean;

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  capture(data) {
    if (data.name == null || data.name == "") {
      toastr.error("Please enter visitor name")
    }
    else {
      this.drawImageToCanvas(this.video.nativeElement);
      this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
      data.imgsrc = this.canvas.nativeElement.toDataURL("image/png");
      // this.isCaptured = true;
      let base64Canvas = this.canvas.nativeElement.toDataURL("image/jpeg").split(';base64,')[1]

      //  var base64=this.canvas.nativeElement.imageAsBase64("base64");
      this.base64 = base64Canvas;
      const date = new Date().toDateString();
      let text = '';
      const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 5; i++) {
        text += possibleText.charAt(Math.floor(Math.random() * possibleText.length));
      }
      const imageName = date + '_' + data.name + '_' + text + '.jpeg';
      const imageBlob = this.dataURItoBlob(base64Canvas);
      this.imageBlob = imageBlob;
      const imageFile = new File([imageBlob], imageName, { type: 'image/jpeg' });
      // console.log(imageFile);
      this.imageFileContent = imageFile;
      // Naming the image
      if (data.fkVisitorType > 0) {
        this.calendarItem.temp = imageName;
      }
      else {
        data.image = imageName;
      }
      // this.formData = new FormData();
      let file: File = imageFile;
      // console.log(file);
      if (file.size > 0) {
        // console.log(file.size); 
        this.file = file;
        this.formData.append('files', file);
      }

    }
  }

  removeCurrent() {
    this.isCaptured = false;
  }

  setPhoto(idx: number) {
    this.isCaptured = true;
    var image = new Image();
    image.src = this.captures[idx];
    this.drawImageToCanvas(image);
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }

  BelongingsCheckList: any[] = [];
  InsertBelongings() {
    let List: any[] = [];
    let connection: any;
    this.selectedBelongings.forEach(element => {
      let belonging: any = {};
      belonging.belongings = element.name;
      belonging.fkVisitorId = this.vid;
      belonging.visitorName = this.calendarItem.name;
      belonging.mobileNo = this.calendarItem.mobile;
      belonging.modelNo = element.modelNo;
      belonging.serialNo = element.serialNo;
      belonging.details = element.Details;
      belonging.type = "Returnable";
      List.push(belonging);
    });
    connection = this.httpService.post(APIURLS.INSERT_VISITOR_BELONGINGS, List)

  }
  InsertAdditionalVisitorBelongings(add, visitor) {
    let List: any[] = [];
    let connection: any;
    add.forEach(element => {
      let belonging: any = {};
      belonging.id = element.id;
      belonging.belongings = element.belongings;
      belonging.fkVisitorId = this.vid;
      belonging.visitorName = visitor.name;
      belonging.mobileNo = visitor.mobile;
      belonging.modelNo = element.modelNo;
      belonging.serialNo = element.serialNo;
      belonging.details = element.details;
      belonging.type = element.type;
      List.push(belonging);
    });
    connection = this.httpService.post(APIURLS.INSERT_VISITOR_BELONGINGS, List)

  }
  onPartialcheckout() {
    this.isLoading = true;
    let connection: any;
    this.checkedRequestList.forEach(element => {
      element.remarks = this.calendarItem.temp5;
      connection = this.httpService.put(APIURLS.UPDATE_VISITOR_BELONGINGS, element.id, element)
    })
    this.isLoading = false;
    connection.then((data) => {
      if (data == 200 || data.id > 0) {
        if (this.isMasterSel == false) {
          this.errMsgPop1 = 'Checkout done partially';
          jQuery("#saveModal").modal('show');
        }


        jQuery("#checkoutModal").modal('hide');

        this.isLoadingPop = false;
        this.isLoading = false;
        this.getAppointments();
        this.getVisitorsList();
        this.barCode = '';
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
    })

  }


  count = 0;

  onAddLineClick() {
    this.isLoading = true;
    let visior = {} as VisitorDetails;
    visior.count = 0;
    this.VisitorDetails.push(visior);
    //console.log(this.departmentList);
    this.count++;
    this.isLoading = false;
  }

  RemoveLine(no, id) {
    this.isLoading = true;
    this.VisitorDetails.splice(no, 1);
    // console.log(this.departmentList);
    this.count--;

    this.isLoading = false;
  }
  checklength() {
    while (this.VisitorDetails.length > this.calendarItem.numberOfPerson) {
      this.VisitorDetails.splice(this.VisitorDetails.length - 1, 1)
    }
    while (this.VisitorDetails.length < this.calendarItem.numberOfPerson) {
      this.onAddLineClick();
    }

  }

  Type: any;
  Belonging: any;
  modelNo: any;
  Details: any;
  SerialNo: any;
  otherBelonging: any;
  BelongingsList: any[] = [];
  addData() {
    let model: any = {};
    this.BelongingsList == undefined ? this.BelongingsList = [] : this.BelongingsList;
    model.type = this.Type;
    model.belongings = this.Belonging;
    model.modelNo = this.modelNo;
    model.details = this.Details;
    model.serialNo = this.SerialNo;
    if (this.Belonging == "Others") {
      model.Belonging = this.otherBelonging;
    }
    this.BelongingsList.push(model);
    this.VisitorDetails[this.VisitorBelongingId].BelongingsList = this.BelongingsList;
    this.VisitorDetails[this.VisitorBelongingId].count = this.BelongingsList.length;
    this.clearInput();
  }

  BelongingEdit: boolean = false;
  editIndex: number = -1;
  EditLine(item, index) {
    this.Type = item.type;
    this.Belonging = item.belongings;
    this.modelNo = item.modelNo;
    this.Details = item.details;
    this.SerialNo = item.serialNo;
    let temp = this.belongings.find(x => x.name == this.Belonging);
    if (temp) {
      this.Belonging = temp.name;
    }
    else {
      this.otherBelonging = item.belongings
      this.Belonging = "Others"
    }
    this.BelongingEdit = true;
    this.editIndex = index;
  }
  updateData() {
    let model: any = {};
    if (this.BelongingsList.length <= 0 || this.editIndex < 0) {
      model.type = this.Type;
      model.belongings = this.Belonging;
      model.modelNo = this.modelNo;
      model.details = this.Details;
      model.serialNo = this.SerialNo;
      if (model.Belonging == "Others") {
        model.Belonging = this.otherBelonging;
      }
      this.BelongingsList.push(model);
    }
    else {
      this.BelongingsList[this.editIndex].type = this.Type;
      this.BelongingsList[this.editIndex].belongings = this.Belonging;
      this.BelongingsList[this.editIndex].modelNo = this.modelNo;
      this.BelongingsList[this.editIndex].details = this.Details;
      this.BelongingsList[this.editIndex].serialNo = this.SerialNo;
      if (this.BelongingsList[this.editIndex].Belonging == "Others") {
        this.BelongingsList[this.editIndex].Belonging = this.otherBelonging;
      }
    }


    this.VisitorDetails[this.VisitorBelongingId].BelongingsList = this.BelongingsList;
    this.VisitorDetails[this.VisitorBelongingId].count = this.BelongingsList.length;
    this.clearInput();
    this.BelongingEdit = false;
  }

  deleteData(data, no) {
    this.isLoading = true;
    this.BelongingsList.splice(no, 1);
    // console.log(this.departmentList);
    this.count--;

    this.isLoading = false;
  }

  clearInput() {
    this.Type = null;
    this.Belonging = null;
    this.modelNo = null;
    this.Details = null;
    this.SerialNo = null;
    this.otherBelonging = null;
  }
}
