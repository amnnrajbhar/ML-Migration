import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { AppointmentRoutingModule } from './appointment-routing.module';
import { AddressesComponent } from '../../HR/appointment/addresses/addresses.component';
import { EntryComponent } from '../../HR/appointment/entry/entry.component';
import { PersonalComponent } from '../../HR/appointment/personal/personal.component';
import { FamilyComponent } from '../../HR/appointment/family/family.component';
import { EducationComponent } from '../../HR/appointment/education/education.component';
import { WorkexperienceComponent } from '../../HR/appointment/workexperience/workexperience.component';
import { LanguagesComponent } from '../../HR/appointment/languages/languages.component';
import { AttachmentsComponent } from '../../HR/appointment/attachments/attachments.component';
import { ListComponent } from '../../HR/appointment/list/list.component';
import { EditComponent } from '../../HR/appointment/edit/edit.component';
import { OffersModule } from '../Offer/offers.module';
import { JoiningListComponent } from '../../HR/appointment/joining-list/joining-list.component';
import { ViewComponent } from '../../HR/appointment/view/view.component';
import { ConfirmJoiningComponent } from '../../HR/appointment/confirm-joining/confirm-joining.component';
import { VerifyComponent } from '../../HR/appointment/verify/verify.component';
import { AddComponent } from '../../HR/appointment/add/add.component';
import { OfficialComponent } from '../../HR/appointment/official/official.component';
import { AssetsComponent } from '../../HR/appointment/assets/assets.component';
import { SalaryComponent } from '../../HR/appointment/salary/salary.component';
import { StatutoryComponent } from '../../HR/appointment/statutory/statutory.component';
import { HrEntryComponent } from '../../HR/appointment/hr-entry/hr-entry.component';
import { ViewFullComponent } from '../../HR/appointment/view-full/view-full.component';
import { PrintComponent } from '../../HR/appointment/print/print.component';
import { SafeHtmlPipe } from '../Services/safe-html.pipe';
import { BankDetailsComponent } from '../../HR/appointment/bank-details/bank-details.component';
import { PreviewComponent } from '../../HR/appointment/preview/preview.component';
import { EditFullComponent } from '../../HR/appointment/edit-full/edit-full.component';
import { NominationComponent } from '../../HR/appointment/nomination/nomination.component';
import { AcceptComponent } from '../../HR/appointment/accept/accept.component';
import { JoiningReportComponent } from '../../HR/appointment/joining-report/joining-report.component';
import { HRSharedModule} from '../shared/hr-shared.module';
import { ActivityReportComponent } from '../../HR/appointment/activity-report/activity-report.component';
import { AppointmentService } from '../Services/appointmentService.service';

@NgModule({
  imports: [
    CommonModule,    
    FormsModule,
    SharedmoduleModule,
    AppointmentRoutingModule,
    OffersModule,
    HRSharedModule
  ],
  declarations: [
    AddressesComponent, 
    EntryComponent, 
    PersonalComponent, 
    FamilyComponent, 
    EducationComponent, 
    WorkexperienceComponent, 
    LanguagesComponent, 
    AttachmentsComponent, 
    ListComponent, 
    EditComponent, 
    JoiningListComponent, 
    ViewComponent, 
    ConfirmJoiningComponent, 
    VerifyComponent, 
    AddComponent, 
    OfficialComponent, 
    AssetsComponent, 
    SalaryComponent, 
    StatutoryComponent, 
    HrEntryComponent, 
    ViewFullComponent, 
    PrintComponent,
    BankDetailsComponent,
    PreviewComponent,
    EditFullComponent,
    NominationComponent,
    AcceptComponent,
    JoiningReportComponent,
    ActivityReportComponent],
    providers: [
      AppointmentService
    ],
})
export class AppointmentModule { }
