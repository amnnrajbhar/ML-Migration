import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { FlowViewerComponent } from '../shared/flow-viewer/flow-viewer.component';
import { OfferActivityComponent } from '../shared/offer-activity/offer-activity.component';
import { SafeHtmlPipe } from '../Services/safe-html.pipe';
import { QuickViewComponent } from './quick-view/quick-view.component';
import { MasterDataService } from '../Services/masterdata.service';
import { AttachmentsComponent } from '../../HR/shared/attachments/attachments.component';
import { DocumentsComponent } from '../../HR/shared/documents/documents.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule
  ],
  declarations: [    
    FlowViewerComponent,
    OfferActivityComponent,
    SafeHtmlPipe,
    QuickViewComponent,
    AttachmentsComponent,
    DocumentsComponent
  ],
  exports: [
    FlowViewerComponent,
    OfferActivityComponent,
    SafeHtmlPipe,
    QuickViewComponent,
    AttachmentsComponent,
    DocumentsComponent
  ],
  providers: [
    MasterDataService
  ],
})
export class HRSharedModule { }
