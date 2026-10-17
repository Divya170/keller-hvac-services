import { AdminUser } from '../modules/auth/admin-user.entity';
import { ContentItem } from '../modules/content/content-item.entity';
import { SiteImage } from '../modules/media/site-image.entity';
import { RequestAttachment } from '../modules/requests/request-attachment.entity';
import { RequestHistory } from '../modules/requests/request-history.entity';
import { ServiceRequest } from '../modules/requests/service-request.entity';
import { Setting } from '../modules/settings/setting.entity';

export const ENTITIES = [Setting, AdminUser, ContentItem, SiteImage, ServiceRequest, RequestHistory, RequestAttachment];
