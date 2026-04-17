import { Conversation, Contact } from './types';
import { AvatarContent } from './AvatarContent';
import { ContactListItem } from './ContactListItem';
import { ConversationListItem } from './ConversationListItem';

export function ConversationList({
    conversations,
    contacts,
    authUserId,
    onConvoClick,
    onContactClick,
}: {
    conversations: Conversation[];
    contacts: Contact[];
    authUserId?: number;
    onConvoClick: (convo: Conversation) => void;
    onContactClick: (userId: number) => void;
}) {
    return (
        <div className="flex h-full flex-col overflow-y-auto">
            {conversations.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
                    No conversations yet
                </div>
            ) : (
                conversations.map((convo) => (
                    <ConversationListItem
                        key={convo.id}
                        convo={convo}
                        authUserId={authUserId}
                        onClick={() => onConvoClick(convo)}
                    />
                ))
            )}

            {contacts.length > 0 && (
                <div className="border-t">
                    <div className="px-3 py-2">
                        <p className="text-xs font-semibold text-gray-500">
                            Start conversation
                        </p>
                    </div>
                    {contacts
                        .filter(
                            (contact) =>
                                contact.id !== authUserId &&
                                !conversations.some((convo) =>
                                    convo.users?.some(
                                        (u) => u.id === contact.id,
                                    ),
                                ),
                        )
                        .slice(0, 5)
                        .map((contact) => (
                            <ContactListItem
                                key={contact.id}
                                contact={contact}
                                conversations={conversations}
                                authUserId={authUserId}
                                onClick={() => onContactClick(contact.id)}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
