<?php 
namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use IDCI\Bundle\SimpleScheduleBundle\Entity\Event; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\Category; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\Location; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\XProperty; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntityRelation; 

/**
 * Api controller.
 *
 * @Route("/admin/link/DBimport")
 */
class DBImportController extends Controller
{
/**
 * @Route("", name="wwwconf_admin_DBimport") 
 */
    public function importAction(Request $request)
    {  
        $JSONFile = json_decode($request->request->get('dataArray'),true); 
        $em = $this->getDoctrine()->getManager(); 
        $entity=null;
        $eventEntities= array();
        $locationEntities= array();
        $categoryEntities= array();
        
        
        //////////////////////  locations  //////////////////////
        $locations = $JSONFile['locations'];
        for($i=0;$i<count($locations);$i++){
            $entity= new Location();
            $current = $locations[$i];  
            foreach ($current as $setter => $value) { 
                //if($setter!="setStartAt" && $setter!="setEndAt")echo "Event->".$setter."(".$value.");\n"; 
                call_user_func_array(array($entity, $setter), array($value)); 
            } 
            $em->persist($entity); 
            array_push($locationEntities,$entity); 
        } 
        $em->flush();  
        
        
        //////////////////////  categories  ////////////////////// 
        $entities = $JSONFile['categories']; 
        for($i=0;$i<count($entities);$i++){
            $current = $entities[$i]; 
            $existsTest = $this->getDoctrine()
                               ->getRepository('IDCISimpleScheduleBundle:Category')
                               ->findOneBy(array('name' => $current['setName']));
            if($existsTest!=null){
              array_push($categoryEntities,$existsTest); 
              continue; //skip existing category
            }
            $entity= new Category();
            foreach ($current as $setter => $value) {
                //if($setter!="setStartAt" && $setter!="setEndAt")echo "Event->".$setter."(".$value.");\n"; 
                call_user_func_array(array($entity, $setter), array($value)); 
            }
            
            $em->persist($entity); 
            array_push($categoryEntities,$entity); 
        }  
          
        $em->flush(); 
        
        //////////////////////  events  //////////////////////
        $entities = $JSONFile['events'];
        for($i=0;$i<count($entities);$i++){
            $entity= new Event();
            $current = $entities[$i];
            foreach ($current as $setter => $value) {
                if($setter=="setStartAt" || $setter=="setEndAt"){
                    $date= explode(' ', $value);
                    $value=new \DateTime($date[0], new \DateTimeZone(date_default_timezone_get()));
                }
                
                if($setter=="setLocation"){
                
                    //echo "XProperty->->".$eventEntities[strval($value)]."->".$value.");\n";
                    $value=$locationEntities[$value]; 
                } 
                
                if($setter=="addCategorie"){
                
                    //echo "XProperty->->".$eventEntities[strval($value)]."->".$value.");\n";
                    $value=$categoryEntities[$value];  
                } 
                    //if($setter!="setStartAt" && $setter!="setEndAt")echo "Event->".$setter."(".$value.");\n"; 
                call_user_func_array(array($entity, $setter), array($value)); 
            }
            $em->persist($entity); 
            array_push($eventEntities,$entity); 
        }
          
        $em->flush(); 
        //////////////////////  x prop  //////////////////////
        //echo "xproperties->\n";
        $xproperties = $JSONFile['xproperties']; 
        for($i=0;$i<count($xproperties);$i++){
            $current = $xproperties[$i];
            $entity= new XProperty();
            foreach ($current as $setter => $value) { 
                if($setter=="setCalendarEntity"){
                
                    //echo "XProperty->->".$eventEntities[strval($value)]."->".$value.");\n";
                    $value=$eventEntities[$value]; 
                } 
                //echo "XProperty->".$setter."(".$value.");\n";
                call_user_func_array(array($entity, $setter), array($value)); 
            }
            $entity->setXKey(rand (0,9999999999));
            $em->persist($entity);
        }
         
        
        $em->flush(); 
        
        //////////////////////  relations  //////////////////////
        //echo "relations->\n";
        $relations = $JSONFile['relations'];
        for($i=0;$i<count($relations);$i++){
            $current = $relations[$i];
            $entity= new CalendarEntityRelation();
            foreach ($current as $setter => $value) {
                if($setter=="setCalendarEntity" || $setter=="setRelatedTo"){
                    if($eventEntities[$value])$value=$eventEntities[$value]; 
                }
                //echo "Relation->".$setter."(".$value.");\n";
                call_user_func_array(array($entity, $setter), array($value)); 
            } 
            $em->persist($entity);
        }   
         
        $em->flush();  

        return new Response("ok");
    } 
}

 /** 
  *  
  */ 

/*USEFULL ENTITIES FUNCTION */

    /*EVENT*/
        //setCreatedAt($createdAt) @param: /Datetime 
        //setStartAt($startAt)
        //setSummary($summary)
        //setDescription($description)
        //setOrganizer($organizer)
        //setContacts($contacts)

    /*CalendarEntityRelation*/
        //setRelationType($relationType) {CHILD|SIBLING|PARENT}
        //setCalendarEntity(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntity = null)
        //setRelatedTo(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $relatedTo = null)

    /*XPROPERTY*/
        //setCalendarEntity(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntity = null)
        //setXNamespace($string); {publication_uri|event_uri}
        //setXKey(rand (0,9999999999));//todo AUTO_INCREMENT ??  
        //setXValue($xValue) uri....

    /* ???????????????????????????????????? */
    /*CATEGORIES*/
        //setName($name)
        //setDescription($description)
        //setLevel($level) int
        //addCalendarEntities(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntities)


    /* ???????????????????????????????????? */
