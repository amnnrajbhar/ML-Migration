import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApproveAssetComponent } from './ApproveAsset.component';
import { ApproveAssetRoutingModule } from './ApproveAsset-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ApproveAssetRoutingModule
    ],
    declarations: [ApproveAssetComponent],
    providers: [DatePipe]
})
export class ApproveAssetModule { }
