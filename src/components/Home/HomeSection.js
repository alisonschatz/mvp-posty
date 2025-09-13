import React from 'react';
import { ArrowRight, Bot } from 'lucide-react';

const HomeSection = ({ onStartChat }) => {
  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Transforme suas ideias em{' '}
          <span className="text-orange-500">posts prontos.</span>{' '}
          Agora!
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          O Posty gera e adapta conteúdos para todas as suas redes sociais, em segundos.
          Sem esforço, só resultados.
        </p>
      </div>

      {/* Call to Action */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Converse com nossa IA
          </h3>
          <p className="text-gray-600 mb-6">
            Nossa inteligência artificial vai te fazer algumas perguntas para criar o post perfeito para você.
          </p>
        </div>

        <button
          onClick={onStartChat}
          className="bg-orange-500 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-3 mx-auto"
        >
          Começar conversa
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="mt-6 flex justify-center items-center space-x-6 text-sm text-gray-500">
          <span>📸 Instagram</span>
          <span>👥 Facebook</span> 
          <span>💼 LinkedIn</span>
          <span>🐦 Twitter</span>
        </div>
      </div>
    </>
  );
};

export default HomeSection;