import React from 'react';
import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion";
import { accordionItems } from '@/lib/constants';


const AboutDetails = () => {
  return (
    <div className="mt-12 space-y-8">
      <Accordion className="w-full" collapsible type="single">
        {accordionItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>
              <img src={item.icon} alt={item.title} className="h-5 w-5 mr-2" />
              {item.title}
            </AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default AboutDetails;
