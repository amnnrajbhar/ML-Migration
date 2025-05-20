import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApproveAssetsComponent } from './ApproveAssets.component';
import { ApproveAssetsRoutingModule } from './ApproveAssets-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ApproveAssetsRoutingModule
    ],
    declarations: [ApproveAssetsComponent],
    providers: [DatePipe]
})
export class ApproveAssetsModule { }
