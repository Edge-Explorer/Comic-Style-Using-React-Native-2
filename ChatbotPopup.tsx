import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';

// Temporary icon replacement until you install vector icons
const IconComponent = ({ name, size, color }: { name: string; size: number; color: string }) => (
  <View style={{ 
    width: size, 
    height: size, 
    backgroundColor: color,
    borderRadius: size/2,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Text style={{color: '#000', fontSize: size/2}}>
      {name === 'comment' ? 'C' : name === 'send' ? '>' : '<'}
    </Text>
  </View>
);

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatbotPopup = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm your Dragon Ball Z assistant. What would you like to know about the Dragon Ball universe?", isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Database of Dragon Ball Z information
  const dbzDatabase = {
    "goku": "Goku (born Kakarot) is the main protagonist of Dragon Ball. He is a Saiyan raised on Earth with the mission to destroy it, but instead became its greatest defender. He constantly strives to become stronger and is known for his pure heart and love of fighting.",
    
    "vegeta": "Vegeta is the prince of the extinct Saiyan race. Initially an enemy of Goku, he later becomes a rival and ally. He's known for his immense pride, dedication to training, and his ongoing quest to surpass Goku.",
    
    "gohan": "Son Gohan is the eldest son of Goku and Chi-Chi. Unlike his father, he doesn't enjoy fighting but has enormous hidden potential. He eventually becomes one of the strongest non-fused characters, defeating Cell during the Cell Games.",
    
    "piccolo": "Piccolo is a Namekian who was initially Goku's enemy but later became one of his closest allies and Gohan's mentor. He's known for his wisdom, strategic mind, and regenerative abilities.",
    
    "frieza": "Frieza is one of the main antagonists of Dragon Ball Z. He's a galactic tyrant who controlled most of the universe and was responsible for destroying Planet Vegeta, the homeworld of the Saiyans.",
    
    "cell": "Cell is an android created by Dr. Gero's computer, designed to possess the cells and abilities of the strongest fighters. His goal was to absorb Androids 17 and 18 to reach his 'perfect form'.",
    
    "buu": "Majin Buu is an ancient magical being created by the wizard Bibidi. He exists in several forms, ranging from innocent and childlike to pure evil. In his final form, Kid Buu, he destroyed countless planets before being defeated by Goku's Spirit Bomb.",
    
    "trunks": "Trunks is the son of Vegeta and Bulma. The Future Trunks variant came from an apocalyptic timeline to warn the Z Fighters about the androids. He's known for his sword skills and was the first character shown to transform into a Super Saiyan in the series.",
    
    "bulma": "Bulma is a brilliant scientist and inventor, the daughter of Dr. Brief (founder of Capsule Corporation). She was the first character to meet Goku and eventually becomes Vegeta's wife and mother to Trunks and Bulla.",
    
    "krillin": "Krillin is Goku's best friend and a skilled martial artist, despite being human with no Saiyan blood. He trained alongside Goku under Master Roshi and has participated in many battles despite often being outmatched by stronger opponents.",
    
    "master roshi": "Master Roshi (also known as the Turtle Hermit) is an ancient and perverted martial arts master who trained Goku and Krillin. He invented the Kamehameha Wave and, despite his age and odd behavior, is still one of Earth's strongest humans.",
    
    "super saiyan": "Super Saiyan is a legendary transformation that multiplies a Saiyan's power tremendously. It's characterized by golden hair, green eyes, and a golden aura. There are multiple levels beyond the basic Super Saiyan form, including Super Saiyan 2, 3, God, and Blue.",
    
    "kamehameha": "The Kamehameha is a powerful energy wave technique invented by Master Roshi. It became Goku's signature move, and is performed by cupping the hands at the side and concentrating ki before releasing it as a powerful energy beam.",
    
    "dragon balls": "The Dragon Balls are seven magical orbs that, when gathered, summon the eternal dragon Shenron who can grant wishes. On Earth, they were created by Kami and later by Dende. Namekian Dragon Balls summon Porunga and have different rules.",
    
    "saiyan": "Saiyans are a nearly extinct warrior race known for their natural combat abilities, tails (which can trigger a Great Ape transformation under a full moon), and their ability to grow stronger after recovering from near-death injuries (Zenkai boost).",
    
    "namekian": "Namekians are a race of green-skinned aliens from Planet Namek. They have the ability to regenerate lost limbs, fuse with other Namekians, and some can create Dragon Balls. Piccolo is the most prominent Namekian character."
  };
  
  // Default responses for questions not in database
  const defaultResponses = [
    "Hmm, even the Dragon Balls couldn't help me answer that specific question about Dragon Ball Z!",
    "That information might be in another saga I haven't watched yet!",
    "My scouter doesn't have data on that specific Dragon Ball Z question.",
    "As Vegeta would say, I need to train more to answer that question!",
    "That's a question even Master Roshi might scratch his head at!"
  ];

  // Local implementation until you create the separate service
  const sendMessageToAI = async (message: string) => {
    // Simulate AI response delay
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        // Convert message to lowercase for case-insensitive matching
        const lowerMessage = message.toLowerCase();
        
        // Check if the message contains any of our known keywords
        let response = '';
        
        // Check each keyword in our database
        for (const [keyword, info] of Object.entries(dbzDatabase)) {
          if (lowerMessage.includes(keyword)) {
            response = info;
            break;
          }
        }
        
        // If no keyword matches found, use a default response
        if (!response) {
          response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
        
        resolve(response);
      }, 1000);
    });
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const response = await sendMessageToAI(inputText);
      const botMessage = { id: (Date.now() + 1).toString(), text: response, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        text: "My scouter malfunctioned! Please try again later.", 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble, 
      item.isUser ? styles.userBubble : styles.botBubble
    ]}>
      {!item.isUser && (
        <View style={styles.botAvatar}>
          <Text style={{color: 'white', textAlign: 'center'}}>DBZ</Text>
        </View>
      )}
      <View style={[
        styles.messageContent,
        item.isUser ? styles.userContent : styles.botContent
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <>
      {/* Floating chat button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => setModalVisible(true)}
      >
        <IconComponent name="comment" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Full screen chat modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Chat header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <IconComponent name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dragon Ball Z Assistant</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Chat messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messageList}
            onContentSizeChange={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }}
            onLayout={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }}
          />

          {/* Input area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about Dragon Ball Z..."
              placeholderTextColor="#999"
              multiline
            />
            {isLoading ? (
              <ActivityIndicator color="#FF6B00" size="small" style={styles.sendButton} />
            ) : (
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSendMessage}
                disabled={inputText.trim() === ''}
              >
                <Text style={{color: inputText.trim() === '' ? '#999' : '#FF6B00', fontSize: 20}}>➤</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF6B00',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FF6B00',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 5,
    maxWidth: '85%',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    borderRadius: 20,
    padding: 12,
    maxWidth: '90%',
  },
  botContent: {
    backgroundColor: '#333',
  },
  userContent: {
    backgroundColor: '#FF6B00',
  },
  messageText: {
    color: '#FFF',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#FFF',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
  },
});

export default ChatbotPopup;