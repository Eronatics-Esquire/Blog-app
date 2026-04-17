import { Contact, Conversation } from './types';
import { getContactName } from './utils';

type ContactListItemProps = {
    contact: Contact;
    conversations: Conversation[];
    authUserId?: number;
    onClick: () => void;
};

export function ContactListItem({
    contact,
    conversations,
    authUserId,
    onClick,
}: ContactListItemProps) {
    const contactName = getContactName(contact);

    return (
        <div
            onClick={onClick}
            className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
        >
            <div className="relative">
                {contact.profile_photo ? (
                    <img
                        src={`/storage/${contact.profile_photo}`}
                        alt={contactName}
                        className="h-8 w-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0084ff] text-xs font-semibold text-white">
                        {contactName.charAt(0).toUpperCase()}
                    </div>
                )}
                <span
                    className={`absolute right-0 bottom-0 h-2 w-2 rounded-full border-2 border-white ${
                        contact.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                />
            </div>
            <span className="text-sm text-gray-700">{contactName}</span>
        </div>
    );
}
